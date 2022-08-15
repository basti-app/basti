import { createInitTarget } from "../../../target/create-init-target.js";
import { InitTarget } from "../../../target/init-target.js";
import { CustomInitTargetInput } from "../../../target/target-input.js";
import { selectCustomTargetVpc } from "../common/select-custom-target-vpc.js";
import { selectTarget } from "../common/select-target.js";

export async function selectInitTarget(): Promise<InitTarget> {
  const target = await selectTarget();

  const targetInput =
    "custom" in target ? await promptForCustomTarget() : target;

  return createInitTarget(targetInput);
}

async function promptForCustomTarget(): Promise<CustomInitTargetInput> {
  const vpcId = await selectCustomTargetVpc();

  return { custom: { vpcId } };
}
