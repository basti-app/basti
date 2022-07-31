import inquirer from "inquirer";
import { getVpcs } from "../../aws/ec2/get-vpcs.js";
import { formatName } from "../../common/format-name.js";
import { ConnectTarget } from "../../target/connect-target.js";
import { createConnectTarget } from "../../target/create-connect-target.js";
import { CustomConnectTargetInput } from "../../target/target-input.js";
import { selectTarget } from "../common/select-target.js";

export async function selectConnectTarget(): Promise<ConnectTarget> {
  const target = await selectTarget();

  const targetInput =
    "custom" in target ? await promptForCustomTarget() : target;

  return createConnectTarget(targetInput);
}

async function promptForCustomTarget(): Promise<CustomConnectTargetInput> {
  const vpcs = await getVpcs();

  const { vpcId, host, port } = await inquirer.prompt([
    {
      type: "list",
      name: "vpcId",
      message: "Select target VPC",
      choices: vpcs.map((vpc) => ({
        name: formatName(vpc),
        value: vpc.id,
      })),
    },
    {
      type: "input",
      name: "host",
      message: "Target host name / IP address",
    },
    {
      type: "number",
      name: "port",
      message: "Target port",
    },
  ]);

  return { custom: { vpcId, host, port } };
}
