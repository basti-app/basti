import inquirer from "inquirer";
import { ConnectTarget } from "../../../target/connect-target.js";
import { createConnectTarget } from "../../../target/create-connect-target.js";
import { CustomConnectTargetInput } from "../../../target/target-input.js";
import { selectCustomTargetVpc } from "../common/select-custom-target-vpc.js";
import { selectTarget } from "../common/select-target.js";
import { selectPort } from "./select-port.js";

const IP_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
const DOMAIN_NAME_REGEX =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

export async function selectConnectTarget(): Promise<ConnectTarget> {
  const target = await selectTarget();

  const targetInput =
    "custom" in target ? await promptForCustomTarget() : target;

  return createConnectTarget(targetInput);
}

async function promptForCustomTarget(): Promise<CustomConnectTargetInput> {
  const vpcId = await selectCustomTargetVpc();

  const { host } = await inquirer.prompt({
    type: "input",
    name: "host",
    message: "Target host name / IP address",
    validate: validateHost,
  });

  const port = await selectPort("Target port number");

  return { custom: { vpcId, host, port } };
}

function validateHost(input: unknown): boolean | string {
  if (
    input == null ||
    typeof input !== "string" ||
    (!IP_REGEX.test(input) && !DOMAIN_NAME_REGEX.test(input))
  ) {
    return "Invalid host name / IP address";
  }

  return true;
}
