import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';

const TMP_DIR = path.resolve('.build-deps-tmp');
const DEPS_DIR = path.resolve('deps');

type DepBuilder = (
  version: string,
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
  );
  const {
    version: depVersion,
    os: [depOs],
    cpu: [depCpu],
  } = depPackage as {
    version: string;
    os: [NodeJS.Platform];
    cpu: [NodeJS.Architecture];
  };

  console.log(`Building ${depName} ${depVersion} for ${depOs}-${depCpu}...`);
  depBuilder(depVersion, depOs, depCpu, depPackageDir);
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

  return (version, os, cpu, packageDir) => {
    const repoDir = path.join(TMP_DIR, 'session-manager-plugin');
    if (!isBuilt) {
      console.log(`Cloning Session Manager ${version}...`);
      cp.execSync(
        `git clone --depth 1 --branch ${version} https://github.com/aws/session-manager-plugin.git ${repoDir}`,
        {
          stdio: 'inherit',
        }
      );
      console.log('Building Session Manager...');
      cp.execSync(`docker build -t session-manager-plugin-image ${repoDir}`, {
        stdio: 'inherit',
      });
      cp.execSync(
        `docker run -it --rm --name session-manager-plugin-build -v ${repoDir}:/session-manager-plugin session-manager-plugin-image make release`,
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
