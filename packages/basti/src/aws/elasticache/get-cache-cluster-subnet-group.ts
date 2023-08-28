import { DescribeCacheSubnetGroupsCommand } from '@aws-sdk/client-elasticache';

import { AwsNotFoundError } from '../common/aws-errors.js';

import { parseElasticacheSubnetGroup } from './parse-elasticache-response.js';
import { elasticacheClient } from './elasticache-client.js';

import type { AwsElasticacheSubnetGroup } from './elasticache-types.js';

export interface GetSubnetGroupInput {
  name: string | undefined;
}

export async function getCacheClusterSubnetGroup({
  name,
}: GetSubnetGroupInput): Promise<AwsElasticacheSubnetGroup | undefined> {
  try {
    const { CacheSubnetGroups } = await elasticacheClient.send(
      new DescribeCacheSubnetGroupsCommand({
        CacheSubnetGroupName: name,
      })
    );

    if (!CacheSubnetGroups) {
      throw new Error(`Invalid response from AWS.`);
    }

    return CacheSubnetGroups.map(group =>
      parseElasticacheSubnetGroup(group)
    )[0];
  } catch (error) {
    if (error instanceof AwsNotFoundError) {
      return undefined;
    }
    throw error;
  }
}
