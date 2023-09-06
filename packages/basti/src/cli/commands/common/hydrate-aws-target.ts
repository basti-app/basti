import { getDbCluster } from '#src/aws/rds/get-db-clusters.js';
import { getDbInstance } from '#src/aws/rds/get-db-instances.js';
import { TargetTypes } from '#src/common/resource-type.js';
import { getReplicationGroup } from '#src/aws/elasticache/get-elasticache-replication-groups.js';
import { getCacheCluster } from '#src/aws/elasticache/get-elasticache-cache-clusters.js';
import {
  getMemcachedCluster,
  getMemcachedNode,
} from '#src/aws/elasticache/get-elasticache-memcached-clusters.js';

import { orThrow } from './get-or-throw.js';

import type { AwsTargetInput } from './prompt-for-aws-target.js';

export type DehydratedAwsTargetInput =
  | { rdsInstanceId: string }
  | { rdsClusterId: string }
  | { elasticacheRedisClusterId: string }
  | { elasticacheRedisNodeId: string }
  | { elasticacheMemcachedNodeId: string }
  | { elasticacheMemcachedClusterId: string };

export async function hydrateAwsTarget(
  targetInput: DehydratedAwsTargetInput
): Promise<AwsTargetInput> {
  if ('rdsInstanceId' in targetInput) {
    return {
      dbInstance: await orThrow(
        async () =>
          await getDbInstance({
            identifier: targetInput.rdsInstanceId,
          }),
        TargetTypes.RDS_INSTANCE,
        targetInput.rdsInstanceId
      ),
    };
  }
  if ('rdsClusterId' in targetInput) {
    return {
      dbCluster: await orThrow(
        async () =>
          await getDbCluster({
            identifier: targetInput.rdsClusterId,
          }),
        TargetTypes.RDS_CLUSTER,
        targetInput.rdsClusterId
      ),
    };
  }
  if ('elasticacheRedisClusterId' in targetInput) {
    return {
      elasticacheRedisCluster: await orThrow(
        async () =>
          await getReplicationGroup({
            identifier: targetInput.elasticacheRedisClusterId,
          }),
        TargetTypes.ELASTICACHE_CLUSTER,
        targetInput.elasticacheRedisClusterId
      ),
    };
  }
  if ('elasticacheRedisNodeId' in targetInput) {
    return {
      elasticacheRedisCluster: await orThrow(
        async () =>
          await getCacheCluster({
            identifier: targetInput.elasticacheRedisNodeId,
          }),
        TargetTypes.ELASTICACHE_NODE,
        targetInput.elasticacheRedisNodeId
      ),
    };
  }
  if ('elasticacheMemcachedNodeId' in targetInput) {
    return {
      elasticacheMemcachedCluster: await orThrow(
        async () =>
          await getMemcachedNode(targetInput.elasticacheMemcachedNodeId),
        TargetTypes.ELASTICACHE_MEMCACHED_NODE,
        targetInput.elasticacheMemcachedNodeId
      ),
    };
  }
  return {
    elasticacheMemcachedCluster: await orThrow(
      async () =>
        await getMemcachedCluster(targetInput.elasticacheMemcachedClusterId),
      TargetTypes.ELASTICACHE_MEMCACHED_CLUSTER,
      targetInput.elasticacheMemcachedClusterId
    ),
  };
}
