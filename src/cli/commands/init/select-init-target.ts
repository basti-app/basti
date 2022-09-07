import { InitTarget } from "../../../target/init-target.js";
import {
  CustomInitTargetInput,
  InitTargetInput,
} from "../../../target/target-input.js";
import { createInitTarget } from "../../../target/create-init-target.js";
import { promptForCustomTargetVpc } from "../common/prompt-for-custom-target-vpc.js";
import { promptForAwsTarget } from "../common/prompt-for-aws-target.js";
import { getDbInstance } from "../../../aws/rds/get-db-instances.js";
import { orThrow } from "../common/get-or-throw.js";
import { TargetType } from "../../../common/resource-type.js";
import { getDbCluster } from "../../../aws/rds/get-db-clusters.js";
import { handleOperation } from "../common/handle-operation.js";

export type InitTargetDehydratedInput =
  | { rdsInstanceId: string }
  | { rdsClusterId: string }
  | { customTargetVpcId: string };

export async function selectInitTarget(
  dehydratedInput?: InitTargetDehydratedInput
): Promise<InitTarget> {
  const targetInput = dehydratedInput
    ? await handleOperation("retrieving specified target", () =>
        hydrateInput(dehydratedInput)
      )
    : await promptForTarget();

  return createInitTarget(targetInput);
}

async function hydrateInput(
  dehydratedInput: InitTargetDehydratedInput
): Promise<InitTargetInput> {
  if ("rdsInstanceId" in dehydratedInput) {
    return {
      dbInstance: await orThrow(
        () =>
          getDbInstance({
            identifier: dehydratedInput.rdsInstanceId,
          }),
        TargetType.RDS_INSTANCE,
        dehydratedInput.rdsInstanceId
      ),
    };
  }
  if ("rdsClusterId" in dehydratedInput) {
    return {
      dbCluster: await orThrow(
        () =>
          getDbCluster({
            identifier: dehydratedInput.rdsClusterId,
          }),
        TargetType.RDS_CLUSTER,
        dehydratedInput.rdsClusterId
      ),
    };
  }

  return {
    custom: {
      vpcId: dehydratedInput.customTargetVpcId,
    },
  };
}

async function promptForTarget(): Promise<InitTargetInput> {
  return (await promptForAwsTarget()) || promptForCustomTarget();
}

async function promptForCustomTarget(): Promise<CustomInitTargetInput> {
  const vpcId = await promptForCustomTargetVpc();

  return { custom: { vpcId } };
}
