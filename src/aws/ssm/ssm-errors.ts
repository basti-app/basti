import { SSMServiceException } from '@aws-sdk/client-ssm';

import {
  AwsAccessDeniedError,
  AwsNotFoundError,
  AwsError,
} from '../common/aws-error.js';

export async function ssmErrorHandler<T>(
  operation: () => Promise<T>
): Promise<T> {
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
