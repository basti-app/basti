import { RDSClient } from '@aws-sdk/client-rds';

import { AwsClient } from '../common/aws-client.js';

import { rdsErrorHandler } from './rds-errors.js';

export const rdsClient = new AwsClient({
  Client: RDSClient,
  errorHandler: rdsErrorHandler,
});
