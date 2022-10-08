import { RuntimeError } from '~/common/runtime-error.js';

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
