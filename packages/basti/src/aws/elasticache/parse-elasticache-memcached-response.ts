import { z } from 'zod';

import { AwsError } from '../common/aws-errors.js';

import type { CacheCluster } from '@aws-sdk/client-elasticache';
import type { AwsElasticacheMemcachedCluster } from './elasticache-types.js';

interface CacheClusterWithNodeIdentifier extends CacheCluster {
  nodeIdentifier: string;
}

export function parseElasticacheMemcachedCacheNode(
  cacheCluster: CacheCluster,
  identifier: string
): AwsElasticacheMemcachedCluster {
  if (cacheCluster.CacheNodes === undefined) {
    throw new AwsError('unexpected error');
  }
  const updatedCluster: CacheClusterWithNodeIdentifier = {
    ...cacheCluster,
    nodeIdentifier: identifier,
  };
  return parseMemcachedCacheClusteWithSpecificNoderResponse(updatedCluster);
}

export const parseMemcachedCacheClusterResponse: (
  response?: CacheCluster
) => AwsElasticacheMemcachedCluster = z
  .object({
    CacheClusterId: z.string(),
    CacheNodes: z.array(
      z.object({
        CacheNodeId: z.string(),
        Endpoint: z.object({
          Address: z.string(),
          Port: z.number(),
        }),
      })
    ),
    CacheSubnetGroupName: z.string(),
    SecurityGroups: z.array(
      z.object({
        SecurityGroupId: z.string(),
      })
    ),
  })
  .transform(response => ({
    identifier: response.CacheClusterId,
    host: response.CacheNodes[0]!.Endpoint.Address,
    port: response.CacheNodes[0]!.Endpoint.Port,
    type: 'memcached',
    cacneNodes: [],
    securityGroups: response.SecurityGroups.map(sg => sg.SecurityGroupId),
    subnetGroupName: response.CacheSubnetGroupName,
    clusterId: response.CacheClusterId,
  })).parse;

export const parseMemcachedCacheClusteWithSpecificNoderResponse: (
  response?: CacheClusterWithNodeIdentifier
) => AwsElasticacheMemcachedCluster = z
  .object({
    CacheClusterId: z.string(),
    ConfigurationEndpoint: z.object({
      Address: z.string(),
      Port: z.number(),
    }),
    Engine: z.string(),
    CacheNodes: z.any(),
    CacheSubnetGroupName: z.string(),
    SecurityGroups: z.array(
      z.object({
        SecurityGroupId: z.string(),
      })
    ),
    nodeIdentifier: z.string(),
  })
  .transform(response => ({
    identifier: response.nodeIdentifier,
    host: response.ConfigurationEndpoint.Address,
    port: response.ConfigurationEndpoint.Port,
    type: 'memcached',
    cacneNodes: response.CacheNodes,
    securityGroups: response.SecurityGroups.map(sg => sg.SecurityGroupId),
    subnetGroupName: response.CacheSubnetGroupName,
    clusterId: response.CacheClusterId,
  })).parse;
