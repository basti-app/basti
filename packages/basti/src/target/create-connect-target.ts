import { CustomConnectTarget } from './custom/custom-connect-target.js';
import { DbClusterConnectTarget } from './db-cluster/db-cluster-connect-target.js';
import { DbInstanceConnectTarget } from './db-instance/db-instance-connect-target.js';
import { ElasticacheRedisClusterConnectTarget } from './elasticache-cluster/elasticache-redis-cluster-connect-target.js';
import { ElasticacheRedisServerlessConnectTarget } from './elasticache-serverless-cache/elasticache-redis-serverless-connect-target.js';
import { ElasticacheMemcachedClusterConnectTarget } from './elasticache-memcached-cluster/elasticache-memcached-cluster-connect-target.js';

import type { ConnectTarget } from './connect-target.js';
import type { ConnectTargetInput } from './target-input.js';

export function createConnectTarget(target: ConnectTargetInput): ConnectTarget {
  if ('dbInstance' in target) {
    return new DbInstanceConnectTarget(target);
  }
  if ('dbCluster' in target) {
    return new DbClusterConnectTarget(target);
  }
  if ('elasticacheRedisCluster' in target) {
    return new ElasticacheRedisClusterConnectTarget(target);
  }
  if ('elasticacheRedisServerlessCache' in target) {
    return new ElasticacheRedisServerlessConnectTarget(target);
  }
  if ('elasticacheMemcachedCluster' in target) {
    return new ElasticacheMemcachedClusterConnectTarget(target);
  }

  return new CustomConnectTarget(target);
}
