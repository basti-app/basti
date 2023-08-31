/* eslint-disable unicorn/no-process-exit */
import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';

const bastiPackage = JSON.parse(
  fs.readFileSync(path.resolve('package.json')).toString()
) as {
  optionalDependencies: Record<string, string>;
};

for (const [dep, version] of Object.entries(
  bastiPackage.optionalDependencies
)) {
  const versionInfo = getVersionInfo(dep, version);

  if (versionInfo?.error === undefined && versionInfo?._id !== undefined) {
    continue;
  }

  console.log(`${dep}@${version} does not exist`);
  process.exit(1);
}

function getVersionInfo(
  dep: string,
  version: string
): Record<string, unknown> | undefined {
  try {
    const versionInfoBuf = cp.execFileSync(
      'npm',
      ['view', '--json', `${dep}@${version}`],
      {
        stdio: 'pipe',
      }
    );

    const versionInfoStr = versionInfoBuf?.toString();

    return versionInfoStr?.length > 0 ? JSON.parse(versionInfoStr) : undefined;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    console.log('npm view error:');
    console.log(errorMessage);
  }
}
