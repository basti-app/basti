import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';

const TMP_DIR = path.resolve('.build-deps-tmp');
const DEPS_DIR = path.resolve('deps');

interface DepPackage {
  version: string;
  // Version (git tag) of aws/session-manager-plugin bundled in the package.
  // Kept separately from the package version because AWS uses four-part
  // versions (e.g. 1.2.295.0) which are not valid semver.
  sessionManagerPluginVersion: string;
  os: [NodeJS.Platform];
  cpu: [NodeJS.Architecture];
}

type DepBuilder = (
  depPackage: DepPackage,
  os: NodeJS.Platform,
  cpu: NodeJS.Architecture,
  packageDir: string
) => void;
const DEP_BUILDERS: Record<string, DepBuilder> = {
  'basti-session-manager-binary': createSessionManagerDependencyBuilder(),
};

if (fs.existsSync(TMP_DIR)) {
  fs.rmdirSync(TMP_DIR, { recursive: true });
}
fs.mkdirSync(TMP_DIR);

const deps = fs.readdirSync(DEPS_DIR);

for (const dep of deps) {
  const depName = dep.split('-').slice(0, -2).join('-');

  const depBuilder = DEP_BUILDERS[depName];
  if (!depBuilder) {
    throw new Error(`No builder for ${depName} available`);
  }

  const depPackageDir = path.join(DEPS_DIR, dep);

  const depPackage = JSON.parse(
    fs.readFileSync(path.join(depPackageDir, 'package.json')).toString()
  ) as DepPackage;
  const {
    version: depVersion,
    os: [depOs],
    cpu: [depCpu],
  } = depPackage;

  console.log(`Building ${depName} ${depVersion} for ${depOs}-${depCpu}...`);
  depBuilder(depPackage, depOs, depCpu, depPackageDir);
}

function createSessionManagerDependencyBuilder(): DepBuilder {
  const sessionManagerPlatforms: Partial<
    Record<`${NodeJS.Platform}-${NodeJS.Architecture}`, string>
  > = {
    'darwin-x64': 'darwin_amd64',
    'darwin-arm64': 'darwin_amd64',
    'linux-ia32': 'linux_386',
    'linux-x64': 'linux_amd64',
    'linux-arm64': 'linux_arm64',
  };

  let isBuilt = false;

  return ({ sessionManagerPluginVersion: version }, os, cpu, packageDir) => {
    const repoDir = path.join(TMP_DIR, 'session-manager-plugin');
    if (!isBuilt) {
      console.log(`Cloning Session Manager ${version}...`);
      cp.execFileSync(
        'git',
        [
          'clone',
          '--depth',
          '1',
          '--branch',
          version,
          'https://github.com/aws/session-manager-plugin.git',
          repoDir,
        ],
        {
          stdio: 'inherit',
        }
      );
      console.log('Building Session Manager...');
      patchDockerfileForArchivedDebian(path.join(repoDir, 'Dockerfile'));
      cp.execFileSync(
        'docker',
        ['build', '-t', 'session-manager-plugin-image', repoDir],
        {
          stdio: 'inherit',
        }
      );
      cp.execFileSync(
        'docker',
        [
          'run',
          '-it',
          '--rm',
          '--name',
          'session-manager-plugin-build',
          '-v',
          `${repoDir}:/session-manager-plugin`,
          'session-manager-plugin-image',
          'make',
          'release',
        ],
        {
          stdio: 'inherit',
        }
      );

      isBuilt = true;
    } else {
      console.log('Session Manager already built, skipping');
    }

    const sessionManagerPlatform = sessionManagerPlatforms[`${os}-${cpu}`];
    if (sessionManagerPlatform === undefined) {
      throw new Error(`No Session Manager binary for ${os}-${cpu} available`);
    }

    const sessionManagerBinaryPath = path.join(
      repoDir,
      'bin',
      `${sessionManagerPlatform}_plugin`,
      'session-manager-plugin'
    );
    if (!fs.existsSync(sessionManagerBinaryPath)) {
      throw new Error(
        `Session Manager binary for ${os}-${cpu} not found at ${sessionManagerBinaryPath}`
      );
    }

    const sessionManagerBinaryOutputPath = path.join(
      packageDir,
      'session-manager-plugin'
    );

    console.log('Copying Session Manager binary...');
    if (fs.existsSync(sessionManagerBinaryOutputPath)) {
      fs.unlinkSync(sessionManagerBinaryOutputPath);
    }
    fs.copyFileSync(sessionManagerBinaryPath, sessionManagerBinaryOutputPath);
  };
}

// The Session Manager Dockerfile is based on Debian buster which reached
// end-of-life. Its apt repositories were moved to archive.debian.org, so the
// apt commands in the original Dockerfile fail. This points apt to the archive
// when the base image is buster and is a no-op for newer base images.
function patchDockerfileForArchivedDebian(dockerfilePath: string): void {
  const aptArchiveFix = [
    'RUN if grep -qs buster /etc/apt/sources.list; then \\',
    "      sed -i -e 's|deb.debian.org/debian|archive.debian.org/debian|' \\",
    "             -e 's|security.debian.org/debian-security|archive.debian.org/debian-security|' \\",
    "             -e '/buster-updates/d' /etc/apt/sources.list && \\",
    `      echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99archive; \\`,
    '    fi',
  ].join('\n');

  const dockerfile = fs.readFileSync(dockerfilePath).toString();
  const lines = dockerfile.split('\n');
  const fromIndex = lines.findIndex(line => line.startsWith('FROM '));
  if (fromIndex === -1) {
    throw new Error(`No FROM instruction found in ${dockerfilePath}`);
  }

  lines.splice(fromIndex + 1, 0, '', aptArchiveFix);
  fs.writeFileSync(dockerfilePath, lines.join('\n'));
}
