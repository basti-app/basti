import { ElastiCacheClient } from '@aws-sdk/client-elasticache';

import { AwsClient } from '../common/aws-client.js';

import { elasticacheErrorHandler } from './elasticache-errors.js';

export const elasticacheClient = new AwsClient({
  Client: ElastiCacheClient,
  errorHandler: elasticacheErrorHandler,
});
