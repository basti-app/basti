import { DescribeCacheClustersCommand } from '@aws-sdk/client-elasticache';

import { parseCacheNodeResponse } from './parse-elasticache-response.js';
import { elasticacheClient } from './elasticache-client.js';

import type { CacheCluster } from '@aws-sdk/client-elasticache';
import type { AwsElasticacheGenericObject } from './elasticache-types.js';

export async function getCacheClusters(): Promise<
  AwsElasticacheGenericObject[]
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
      return parseCacheNodeResponse(cacheNode);
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
