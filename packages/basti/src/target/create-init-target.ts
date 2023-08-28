import { CustomInitTarget } from './custom/custom-init-target.js';
import { DbClusterInitTarget } from './db-cluster/db-cluster-init-target.js';
import { DbInstanceInitTarget } from './db-instance/db-instance-init-target.js';
import { ElasticacheClusterInitTarget } from './elasticache-cluster/elasticache-cluster-init-target.js';

import type { InitTarget } from './init-target.js';
import type { InitTargetInput } from './target-input.js';

export function createInitTarget(target: InitTargetInput): InitTarget {
  if ('dbInstance' in target) {
    return new DbInstanceInitTarget(target);
  }
  if ('dbCluster' in target) {
    return new DbClusterInitTarget(target);
  }
  if ('elasticacheCluster' in target) {
    return new ElasticacheClusterInitTarget(target);
  }
  return new CustomInitTarget(target.custom);
}
