import { SSMClient, SSMServiceException } from '@aws-sdk/client-ssm';
import { AwsClient } from '../common/aws-client.js';
import {
  AwsAccessDeniedError,
  AwsError,
  AwsNotFoundError,
} from '../common/aws-error.js';

export const ssmClient = new AwsClient({
  client: SSMClient,
  errorHandler,
});

export async function errorHandler<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof SSMServiceException &&
      error.name === 'AccessDeniedException'
    ) {
      throw new AwsAccessDeniedError();
    }
    if (
      error instanceof SSMServiceException &&
      error.name === 'ParameterNotFound'
    ) {
      throw new AwsNotFoundError();
    }
    if (
      error instanceof SSMServiceException &&
      error.message.toLocaleLowerCase().includes('not connected')
    ) {
      throw new AwsSsmInstanceNotConnectedError();
    }
    throw error;
  }
}

export class AwsSsmInstanceNotConnectedError extends AwsError {
  constructor() {
    super('Instance is not connected to SSM');
  }
}
