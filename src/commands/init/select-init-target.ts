import inquirer from "inquirer";
import { getVpcs } from "../../aws/ec2/get-vpcs.js";
import { formatName } from "../../common/format-name.js";
import { createInitTarget } from "../../target/create-init-target.js";
import { InitTarget } from "../../target/init-target.js";
import { CustomInitTargetInput } from "../../target/target-input.js";
import { selectTarget } from "../common/select-target.js";

export async function selectInitTarget(): Promise<InitTarget> {
  const target = await selectTarget();

  const targetInput =
    "custom" in target ? await promptForCustomTarget() : target;

  return createInitTarget(targetInput);
}

async function promptForCustomTarget(): Promise<CustomInitTargetInput> {
  const vpcs = await getVpcs();

  const { vpcId } = await inquirer.prompt({
    type: "list",
    name: "vpcId",
    message: "Select target VPC",
    choices: vpcs.map((vpc) => ({
      name: formatName(vpc),
      value: vpc.id,
    })),
  });

  return { custom: { vpcId } };
}
