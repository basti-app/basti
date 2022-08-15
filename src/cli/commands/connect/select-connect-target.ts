import inquirer from "inquirer";
import { ConnectTarget } from "../../../target/connect-target.js";
import { createConnectTarget } from "../../../target/create-connect-target.js";
import { CustomConnectTargetInput } from "../../../target/target-input.js";
import { selectCustomTargetVpc } from "../common/select-custom-target-vpc.js";
import { selectTarget } from "../common/select-target.js";

export async function selectConnectTarget(): Promise<ConnectTarget> {
  const target = await selectTarget();

  const targetInput =
    "custom" in target ? await promptForCustomTarget() : target;

  return createConnectTarget(targetInput);
}

async function promptForCustomTarget(): Promise<CustomConnectTargetInput> {
  const vpcId = await selectCustomTargetVpc();

  const { host, port } = await inquirer.prompt([
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
