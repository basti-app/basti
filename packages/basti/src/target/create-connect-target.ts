import { CustomConnectTarget } from './custom/custom-connect-target.js';
import { DbClusterConnectTarget } from './db-cluster/db-cluster-connect-target.js';
import { DbInstanceConnectTarget } from './db-instance/db-instance-connect-target.js';
import { ElasticacheClusterConnectTarget } from './elasticache-cluster/elasticache-cluster-connect-target.js';

import type { ConnectTarget } from './connect-target.js';
import type { ConnectTargetInput } from './target-input.js';

export function createConnectTarget(target: ConnectTargetInput): ConnectTarget {
  if ('dbInstance' in target) {
    return new DbInstanceConnectTarget(target);
  }
  if ('dbCluster' in target) {
    return new DbClusterConnectTarget(target);
  }
  if ('elasticacheCluster' in target) {
    return new ElasticacheClusterConnectTarget(target);
  }
  return new CustomConnectTarget(target);
}
