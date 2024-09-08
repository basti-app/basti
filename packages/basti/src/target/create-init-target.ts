import { CustomInitTarget } from './custom/custom-init-target.js';
import { DbClusterInitTarget } from './db-cluster/db-cluster-init-target.js';
import { DbInstanceInitTarget } from './db-instance/db-instance-init-target.js';
import { ElasticacheRedisClusterInitTarget } from './elasticache-cluster/elasticache-redis-cluster-init-target.js';
import { ElasticacheRedisServerlessInitTarget } from './elasticache-serverless-cache/elasticache-redis-serverless-init-target.js';
import { ElasticacheMemcachedClusterInitTarget } from './elasticache-memcached-cluster/elasticache-memcached-cluster-init-target.js';

import type { InitTarget } from './init-target.js';
import type { InitTargetInput } from './target-input.js';

export function createInitTarget(target: InitTargetInput): InitTarget {
  if ('dbInstance' in target) {
    return new DbInstanceInitTarget(target);
  }
  if ('dbCluster' in target) {
    return new DbClusterInitTarget(target);
  }
  if ('elasticacheRedisCluster' in target) {
    return new ElasticacheRedisClusterInitTarget(target);
  }
  if ('elasticacheMemcachedCluster' in target) {
    return new ElasticacheMemcachedClusterInitTarget(target);
  }
  if ('elasticacheRedisServerlessCache' in target) {
    return new ElasticacheRedisServerlessInitTarget(target);
  }
  return new CustomInitTarget(target.custom);
}
