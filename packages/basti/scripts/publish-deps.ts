import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';

const DEPS_DIR = path.resolve('deps');

const deps = fs.readdirSync(DEPS_DIR);

for (const dep of deps) {
  console.log(`Publishing ${dep}...`);

  cp.execFileSync('npm', ['publish'], {
    cwd: path.join(DEPS_DIR, dep),
    stdio: 'inherit',
  });
}
