import inquirer from "inquirer";
import { getVpcs } from "../../../aws/ec2/get-vpcs.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { handleOperation } from "./handle-operation.js";

export async function promptForCustomTargetVpc(): Promise<string> {
  const vpcs = await handleOperation("retrieving VPCs", () => getVpcs());

  if (vpcs.length === 0) {
    cli.info(`No VPCs found in your account`);
    process.exit(0);
  }

  const { vpcId } = await inquirer.prompt({
    type: "list",
    name: "vpcId",
    message: "Select target VPC",
    choices: vpcs.map((vpc) => ({
      name: fmt.resourceName(vpc),
      value: vpc.id,
    })),
  });

  return vpcId;
}
