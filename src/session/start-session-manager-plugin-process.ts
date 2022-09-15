import { AwsSsmSessionDescriptor } from '../aws/ssm/types.js';
import {
  OutputOptimizedChildProcess,
  spawnProcess,
} from '../common/child-process.js';
import { RuntimeError } from '../common/runtime-error.js';

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

  return new Promise((resolve, reject) => {
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

export class SessionManagerPluginNonInstalledError extends RuntimeError {
  constructor() {
    super('session-manager-plugin is not installed');
  }
}

export class SessionManagerPluginPortInUseError extends RuntimeError {
  constructor() {
    super('Port is already in use');
  }
}

export class SessionManagerPluginUnexpectedExitError extends RuntimeError {
  readonly reason: number | NodeJS.Signals;
  readonly output: string;
  readonly errorOutput: string;

  constructor(
    reason: number | NodeJS.Signals,
    output: string,
    errorOutput: string
  ) {
    super('session-manager-plugin exited unexpectedly');

    this.reason = reason;
    this.output = output;
    this.errorOutput = errorOutput;
  }
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
  if (error.code === 'ENOENT') {
    return new SessionManagerPluginNonInstalledError();
  } else {
    return error;
  }
}

function isPortOpened(line: string): boolean {
  return line.toLowerCase().includes('waiting for connection');
}

function isPortInUse(line: string): boolean {
  return line.toLowerCase().includes('address already in use');
}
