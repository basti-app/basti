import { DescribeCacheClustersCommand } from '@aws-sdk/client-elasticache';

import { AwsNotFoundError } from '../common/aws-errors.js';

import { parseCacheNodeResponse } from './parse-elasticache-redis-response.js';
import { elasticacheClient } from './elasticache-client.js';

import type { CacheCluster } from '@aws-sdk/client-elasticache';
import type { AwsElasticacheRedisGenericObject } from './elasticache-types.js';

export interface getCacheClusterInput {
  identifier: string;
}

export async function getCacheClusters(): Promise<
  AwsElasticacheRedisGenericObject[]
> {
  const { CacheClusters } = await elasticacheClient.send(
    new DescribeCacheClustersCommand({ ShowCacheNodeInfo: true })
  );

  if (!CacheClusters) {
    throw new Error(`Invalid response from AWS.`);
  }
  const unFlatedArray = CacheClusters.map(nodeGroup => {
    if (nodeGroup.CacheNodes === undefined) return [];
    return nodeGroup.CacheNodes.map(cacheNode => {
      cacheNode.CacheNodeId = nodeGroup.CacheClusterId;
      return parseCacheNodeResponse(cacheNode, nodeGroup.ReplicationGroupId!);
    });
  });
  return [...unFlatedArray.flat()];
}

export async function getRawCacheClusters(): Promise<CacheCluster[]> {
  const { CacheClusters } = await elasticacheClient.send(
    new DescribeCacheClustersCommand({})
  );

  if (!CacheClusters) {
    throw new Error(`Invalid response from AWS.`);
  }

  return CacheClusters;
}

export async function getDescribedCacheCluster(
  clusterIdentifier: string
): Promise<CacheCluster> {
  const clusters = await elasticacheClient.send(
    new DescribeCacheClustersCommand({
      CacheClusterId: clusterIdentifier,
      ShowCacheNodeInfo: true,
    })
  );
  if (
    clusters === undefined ||
    clusters.CacheClusters === undefined ||
    clusters.CacheClusters.length === 0 ||
    clusters.CacheClusters[0] === undefined
  ) {
    throw new Error(`Cluster ${clusterIdentifier} not found`);
  }
  return clusters.CacheClusters[0];
}

export async function getCacheCluster({
  identifier,
}: getCacheClusterInput): Promise<
  AwsElasticacheRedisGenericObject | undefined
> {
  try {
    const cacheCluster = await getDescribedCacheCluster(identifier);
    if (
      cacheCluster.ReplicationGroupId === undefined ||
      cacheCluster.CacheNodes === undefined ||
      cacheCluster.CacheNodes[0] === undefined
    ) {
      throw new Error(`Invalid response from AWS.`);
    }
    return parseCacheNodeResponse(
      cacheCluster.CacheNodes[0],
      cacheCluster.ReplicationGroupId
    );
  } catch (error) {
    if (error instanceof AwsNotFoundError) {
      return undefined;
    }
    throw error;
  }
}
