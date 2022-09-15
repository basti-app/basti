import { getDbCluster } from '../../../aws/rds/get-db-clusters.js';
import { getDbInstance } from '../../../aws/rds/get-db-instances.js';
import { TargetTypes } from '../../../common/resource-type.js';
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
        async () =>
          await getDbInstance({
            identifier: targetInput.rdsInstanceId,
          }),
        TargetTypes.RDS_INSTANCE,
        targetInput.rdsInstanceId
      ),
    };
  }
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
