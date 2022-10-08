import { EC2ServiceException } from '@aws-sdk/client-ec2';

import {
  AwsAccessDeniedError,
  AwsDependencyViolationError,
  AwsError,
} from '../common/aws-errors.js';

export async function ec2ErrorHandler<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof EC2ServiceException &&
      error.name === 'UnauthorizedOperation'
    ) {
      throw new AwsAccessDeniedError();
    }
    if (
      error instanceof EC2ServiceException &&
      error.message.toLocaleLowerCase().includes('instance profile')
    ) {
      throw new AwsInstanceProfileNotFoundError();
    }
    if (
      error instanceof EC2ServiceException &&
      error.message.toLowerCase().includes('volume attached')
    ) {
      throw new AwsNoRootVolumeAttachedError();
    }
    if (
      error instanceof EC2ServiceException &&
      error.name === 'DependencyViolation'
    ) {
      throw new AwsDependencyViolationError();
    }
    throw error;
  }
}

export class AwsInstanceProfileNotFoundError extends AwsError {
  constructor() {
    super('Instance profile not found');
  }
}

export class AwsNoRootVolumeAttachedError extends AwsError {
  constructor() {
    super('No root volume attached to the EC2 instance');
  }
}
