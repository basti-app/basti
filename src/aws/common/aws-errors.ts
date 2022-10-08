import { RuntimeError } from '~/common/runtime-errors.js';

export class AwsError extends RuntimeError {}

export class AwsAccessDeniedError extends AwsError {
  constructor(public readonly iamMessage?: string) {
    super(
      'User is not allowed to perform the operation' +
        (iamMessage === undefined ? '' : `. ${iamMessage}`)
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
