import { AwsSsmSessionDescriptor } from '../aws/ssm/types.js';
import {
  OutputOptimizedChildProcess,
  spawnProcess,
} from '../common/child-process.js';

import {
  SessionManagerPluginUnexpectedExitError,
  SessionManagerPluginPortInUseError,
  SessionManagerPluginNonInstalledError,
} from './session-errors.js';

export type ProcessExitedHook = (error: Error) => void;

export interface StartSessionManagerPluginInput {
  sessionDescriptor: AwsSsmSessionDescriptor;
  hooks?: {
    onProcessExited?: ProcessExitedHook;
  };
}

export async function startSessionManagerPluginProcess({
  sessionDescriptor,
  hooks,
}: StartSessionManagerPluginInput): Promise<void> {
  const sessionManager = spawnPluginProcess(sessionDescriptor);

  sessionManager.process.on('exit', (code, signal) => {
    hooks?.onProcessExited?.(
      new SessionManagerPluginUnexpectedExitError(
        (code ?? signal)!,
        sessionManager.collectOutput(),
        sessionManager.collectErrorOutput()
      )
    );
  });

  return await new Promise((resolve, reject) => {
    sessionManager.onLine(line => isPortOpened(line) && resolve());

    sessionManager.onLine(
      line =>
        isPortInUse(line) && reject(new SessionManagerPluginPortInUseError())
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

  return spawnProcess('session-manager-plugin', args);
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
