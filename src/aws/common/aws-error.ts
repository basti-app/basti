import { RuntimeError } from '../../common/runtime-error.js';

export class AwsError extends RuntimeError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class AwsAccessDeniedError extends AwsError {
  constructor(public readonly iamMessage?: string) {
    super(
      'User is not allowed to perform the operation' +
        (iamMessage ? `. ${iamMessage}` : '')
    );
  }
}

export class AwsNotFoundError extends AwsError {
  constructor() {
    super('Resource not found');
  }
}

export class AwsDependencyViolationError extends AwsError {
  constructor() {
    super('Resource has dependent resources');
  }
}
