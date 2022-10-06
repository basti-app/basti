import { IAMClient, IAMServiceException } from '@aws-sdk/client-iam';

import { AwsClient } from '../common/aws-client.js';
import { AwsAccessDeniedError } from '../common/aws-error.js';

export const iamClient = new AwsClient({
  Client: IAMClient,
  errorHandler,
});

async function errorHandler<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof IAMServiceException && error.name === 'AccessDenied') {
      throw new AwsAccessDeniedError(error.message);
    }

    throw error;
  }
}
