import { IAMClient } from '@aws-sdk/client-iam';

import { AwsClient } from '../common/aws-client.js';

import { iamErrorHandler } from './iam-errors.js';

export const iamClient = new AwsClient({
  Client: IAMClient,
  errorHandler: iamErrorHandler,
});
