import { SSMClient } from '@aws-sdk/client-ssm';

import { AwsClient } from '../common/aws-client.js';

import { ssmErrorHandler } from './ssm-errors.js';

export const ssmClient = new AwsClient({
  Client: SSMClient,
  errorHandler: ssmErrorHandler,
});
