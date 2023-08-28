import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { spawnProcess } from '../common/child-process.js';

import {
  SessionManagerPluginExitError,
  SessionManagerPluginPortInUseError,
  SessionManagerPluginNonInstalledError,
  SessionManagerPluginTimeoutError,
} from './session-errors.js';

import type { AwsSsmSessionDescriptor } from '../aws/ssm/types.js';
import type {
  ChildProcessExitDescription,
  OutputOptimizedChildProcess,
} from '../common/child-process.js';

export interface StartSessionManagerPluginHooks {
  onExit?: (exitDescription: ChildProcessExitDescription) => void;
  onErrorExit?: (error: SessionManagerPluginExitError) => void;
}

export interface StartSessionManagerPluginInput {
  sessionDescriptor: AwsSsmSessionDescriptor;
  hooks?: StartSessionManagerPluginHooks;
}

export async function startSessionManagerPluginProcess({
  sessionDescriptor,
  hooks,
}: StartSessionManagerPluginInput): Promise<void> {
  const sessionManager = spawnPluginProcess(sessionDescriptor);

  return await new Promise((resolve, reject) => {
    let isStarted = false;

    sessionManager.onLine(line => {
      if (isPortOpened(line)) {
        isStarted = true;
        startExitListener(sessionManager, hooks);
        resolve();
      }
    });

    setTimeout(() => {
      if (!isStarted) {
        sessionManager.kill();
        reject(
          new SessionManagerPluginTimeoutError(
            sessionManager.collectAllOutput()
          )
        );
      }
    }, 30_000).unref();

    sessionManager.onLine(
      line =>
        isPortInUse(line) && reject(new SessionManagerPluginPortInUseError())
    );
    sessionManager.onExit(exitDescription =>
      reject(new SessionManagerPluginExitError(exitDescription))
    );
    sessionManager.process.on('error', error =>
      reject(parseProcessError(error))
    );
  });
}

function spawnPluginProcess(
  sessionDescriptor: AwsSsmSessionDescriptor
): OutputOptimizedChildProcess {
  // Session Manager Plugin arguments could be found here:
  // https://github.com/aws/session-manager-plugin/blob/916aa5c1c241967baaf20a0f3edcde44a45e4dfb/src/sessionmanagerplugin/session/session.go#L162
  const args = [
    JSON.stringify(sessionDescriptor.response),
    sessionDescriptor.region,
    'StartSession',
    '',
    JSON.stringify(sessionDescriptor.request),
    sessionDescriptor.endpoint,
  ];

  const binaryPath = getPluginBinaryPath();

  return spawnProcess(binaryPath, args);
}

function startExitListener(
  sessionManager: OutputOptimizedChildProcess,
  hooks?: StartSessionManagerPluginHooks
): void {
  sessionManager.onExit(exitDescription => {
    if (exitDescription.reason === 0) {
      hooks?.onExit?.(exitDescription);
    } else {
      hooks?.onErrorExit?.(new SessionManagerPluginExitError(exitDescription));
    }
  });
}

function parseProcessError(error: NodeJS.ErrnoException): Error {
  return error.code === 'ENOENT'
    ? new SessionManagerPluginNonInstalledError()
    : error;
}

function isPortOpened(line: string): boolean {
  return line.toLowerCase().includes('waiting for connection');
}

function isPortInUse(line: string): boolean {
  return line.toLowerCase().includes('address already in use');
}

function getPluginBinaryPath(): string {
  const rootDir = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)),
    '..',
    '..',
    '..'
  );
  const devDepsDir = path.resolve(rootDir, 'deps');
  const nodeModulesDir = path.resolve(rootDir, 'node_modules');
  const outerDir = path.resolve(rootDir, '..');

  const devPluginBinaryPath = getDepPluginBinaryPath(devDepsDir);
  const nodeModulesPluginBinaryPath = getDepPluginBinaryPath(nodeModulesDir);
  const outerPluginBinaryPath = getDepPluginBinaryPath(outerDir);

  return fs.existsSync(devPluginBinaryPath)
    ? devPluginBinaryPath
    : fs.existsSync(nodeModulesPluginBinaryPath)
    ? nodeModulesPluginBinaryPath
    : fs.existsSync(outerPluginBinaryPath)
    ? outerPluginBinaryPath
    : 'session-manager-plugin';
}

function getDepPluginBinaryPath(depsDir: string): string {
  return path.resolve(
    depsDir,
    `basti-session-manager-binary-${process.platform}-${process.arch}`,
    'session-manager-plugin'
  );
}
