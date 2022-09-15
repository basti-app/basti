import { CustomInitTarget } from './custom/custom-init-target.js';
import { DbClusterInitTarget } from './db-cluster/db-cluster-init-target.js';
import { DbInstanceInitTarget } from './db-instance/db-instance-init-target.js';
import { InitTarget } from './init-target.js';
import { InitTargetInput } from './target-input.js';

export function createInitTarget(target: InitTargetInput): InitTarget {
  if ('dbInstance' in target) {
    return new DbInstanceInitTarget(target);
  }
  if ('dbCluster' in target) {
    return new DbClusterInitTarget(target);
  }
  return new CustomInitTarget(target.custom);
}
