import { ChildProcessExitDescription } from '#src/common/child-process.js';
import { RuntimeError } from '#src/common/runtime-errors.js';

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

export class SessionManagerPluginExitError extends RuntimeError {
  readonly exitDescription: ChildProcessExitDescription;

  constructor(exitDescription: ChildProcessExitDescription) {
    super('session-manager-plugin exited unexpectedly');

    this.exitDescription = exitDescription;
  }
}
