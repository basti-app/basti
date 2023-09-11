import { DescribeCacheClustersCommand } from '@aws-sdk/client-elasticache';

import {
  parseMemcachedCacheClusteWithSpecificNoderResponse,
  parseMemcachedCacheClusterResponse,
} from './parse-elasticache-memcached-response.js';
import { elasticacheClient } from './elasticache-client.js';

import type { CacheCluster } from '@aws-sdk/client-elasticache';
import type { AwsElasticacheMemcachedCluster } from './elasticache-types.js';

export interface getCacheClusterInput {
  identifier: string;
}

export async function getMemcachedClusters(): Promise<
  AwsElasticacheMemcachedCluster[]
> {
  const memcachedClusters = await getRawMemcachedClusters();
  return memcachedClusters.map(cacheCluster => {
    return parseMemcachedCacheClusterResponse(cacheCluster);
  });
}

export async function getRawMemcachedClusters(): Promise<CacheCluster[]> {
  const { CacheClusters } = await elasticacheClient.send(
    new DescribeCacheClustersCommand({
      ShowCacheNodeInfo: true,
      ShowCacheClustersNotInReplicationGroups: true,
    })
  );

  if (!CacheClusters) {
    throw new Error(`Invalid response from AWS.`);
  }
  const memcachedClusters = CacheClusters.filter(
    cacheCluster => cacheCluster.Engine === 'memcached'
  );
  return memcachedClusters;
}

export async function getMemcachedCluster(
  identifier: string
): Promise<AwsElasticacheMemcachedCluster> {
  const { CacheClusters } = await elasticacheClient.send(
    new DescribeCacheClustersCommand({
      ShowCacheNodeInfo: true,
      ShowCacheClustersNotInReplicationGroups: true,
      CacheClusterId: identifier,
    })
  );
  if (!CacheClusters) {
    throw new Error(`Invalid response from AWS.`);
  }
  return parseMemcachedCacheClusterResponse(CacheClusters[0]);
}

export async function getMemcachedNode(
  identifier: string
): Promise<AwsElasticacheMemcachedCluster> {
  const cacheClusters = await getRawMemcachedClusters();
  const cluster = cacheClusters.find(cluster =>
    cluster.CacheNodes!.some(
      node =>
        cluster.CacheClusterId?.concat('-', node.CacheNodeId!) === identifier
    )
  )!;
  if (cluster === undefined) {
    throw new Error(`Node ${identifier} not found`);
  }
  return parseMemcachedCacheClusteWithSpecificNoderResponse({
    ...cluster,
    nodeIdentifier: identifier,
  });
}
