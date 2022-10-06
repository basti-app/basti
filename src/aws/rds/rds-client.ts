import { RDSClient, RDSServiceException } from '@aws-sdk/client-rds';

import { AwsClient } from '../common/aws-client.js';
import {
  AwsAccessDeniedError,
  AwsError,
  AwsNotFoundError,
} from '../common/aws-error.js';

export const rdsClient = new AwsClient({
  Client: RDSClient,
  errorHandler,
});

export async function errorHandler<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof RDSServiceException && error.name === 'AccessDenied') {
      throw new AwsAccessDeniedError();
    }
    if (
      error instanceof RDSServiceException &&
      (error.name === 'DBClusterNotFoundFault' ||
        error.name === 'DBInstanceNotFoundFault' ||
        error.name === 'DBSubnetGroupNotFoundFault')
    ) {
      throw new AwsNotFoundError();
    }
    if (
      error instanceof RDSServiceException &&
      error.name === 'InvalidParameterCombination' &&
      error.message.toLowerCase().includes('securitygroup')
    ) {
      throw new AwsTooManySecurityGroupsAttachedError();
    }
    if (
      error instanceof RDSServiceException &&
      (error.name === 'InvalidDBClusterStateFault' ||
        error.name === 'InvalidDBInstanceStateFault')
    ) {
      throw new AwsInvalidRdsStateError();
    }
    throw error;
  }
}

export class AwsTooManySecurityGroupsAttachedError extends AwsError {
  constructor() {
    super(`Too many security groups attached`);
  }
}

export class AwsInvalidRdsStateError extends AwsError {
  constructor() {
    super(`Invalid DB state`);
  }
}
