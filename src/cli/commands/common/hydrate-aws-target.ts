import { getDbCluster } from '../../../aws/rds/get-db-clusters.js';
import { getDbInstance } from '../../../aws/rds/get-db-instances.js';
import { TargetType } from '../../../common/resource-type.js';
import { orThrow } from './get-or-throw.js';
import { AwsTargetInput } from './prompt-for-aws-target.js';

export type DehydratedAwsTargetInput =
  | { rdsInstanceId: string }
  | { rdsClusterId: string };

export async function hydrateAwsTarget(
  targetInput: DehydratedAwsTargetInput
): Promise<AwsTargetInput> {
  if ('rdsInstanceId' in targetInput) {
    return {
      dbInstance: await orThrow(
        () =>
          getDbInstance({
            identifier: targetInput.rdsInstanceId,
          }),
        TargetType.RDS_INSTANCE,
        targetInput.rdsInstanceId
      ),
    };
  }
  return {
    dbCluster: await orThrow(
      () =>
        getDbCluster({
          identifier: targetInput.rdsClusterId,
        }),
      TargetType.RDS_CLUSTER,
      targetInput.rdsClusterId
    ),
  };
}
