import { getDbCluster } from '#src/aws/rds/get-db-clusters.js';
import { getDbInstance } from '#src/aws/rds/get-db-instances.js';
import { TargetTypes } from '#src/common/resource-type.js';
import { getReplicationGroup } from '#src/aws/elasticache/get-elasticache-replication-groups.js';

import { orThrow } from './get-or-throw.js';

import type { AwsTargetInput } from './prompt-for-aws-target.js';

export type DehydratedAwsTargetInput =
  | { rdsInstanceId: string }
  | { rdsClusterId: string }
  | { elasticacheCluster: string };

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
  return {
    elasticacheCluster: await orThrow(
      async () =>
        await getReplicationGroup({
          identifier: targetInput.elasticacheCluster,
        }),
      TargetTypes.ELASTICACHE_CLUSTER,
      targetInput.elasticacheCluster
    ),
  };
}
