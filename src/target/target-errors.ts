import { RuntimeError } from '#src/common/runtime-errors.js';

export class TargetNotInitializedError extends RuntimeError {
  constructor() {
    super('Target is not initialized');
  }
}

export class AccessSecurityGroupCreationError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't create access security group`, cause);
  }
}

export class AccessSecurityGroupAttachmentError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't attach access security group to the target`, cause);
  }
}
