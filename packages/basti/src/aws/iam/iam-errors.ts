import { IAMServiceException } from '@aws-sdk/client-iam';

import { AwsAccessDeniedError } from '../common/aws-errors.js';

export async function iamErrorHandler<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof IAMServiceException && error.name === 'AccessDenied') {
      throw new AwsAccessDeniedError(error.message);
    }

    throw error;
  }
}
