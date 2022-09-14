import { InitTarget } from "../../../target/init-target.js";
import {
  CustomInitTargetInput,
  InitTargetInput,
} from "../../../target/target-input.js";
import { createInitTarget } from "../../../target/create-init-target.js";
import { promptForCustomTargetVpc } from "../common/prompt-for-custom-target-vpc.js";
import { promptForAwsTarget } from "../common/prompt-for-aws-target.js";
import { handleOperation } from "../common/handle-operation.js";
import {
  DehydratedAwsTargetInput,
  hydrateAwsTarget,
} from "../common/hydrate-aws-target.js";

export type DehydratedInitTargetInput =
  | DehydratedAwsTargetInput
  | { customTargetVpcId: string };

export async function selectInitTarget(
  dehydratedInput?: DehydratedInitTargetInput
): Promise<InitTarget> {
  const targetInput = dehydratedInput
    ? await handleOperation("Retrieving specified target", () =>
        hydrateInput(dehydratedInput)
      )
    : await promptForTarget();

  return createInitTarget(targetInput);
}

async function hydrateInput(
  targetInput: DehydratedInitTargetInput
): Promise<InitTargetInput> {
  if ("customTargetVpcId" in targetInput) {
    return {
      custom: {
        vpcId: targetInput.customTargetVpcId,
      },
    };
  }

  return hydrateAwsTarget(targetInput);
}

async function promptForTarget(): Promise<InitTargetInput> {
  return (await promptForAwsTarget()) || promptForCustomTarget();
}

async function promptForCustomTarget(): Promise<CustomInitTargetInput> {
  const vpcId = await promptForCustomTargetVpc();

  return { custom: { vpcId } };
}
