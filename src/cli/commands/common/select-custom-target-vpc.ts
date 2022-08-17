import inquirer from "inquirer";
import { getVpcs } from "../../../aws/ec2/get-vpcs.js";
import { fmt } from "../../../common/fmt.js";
import { handleOperation } from "./handle-operation.js";

export async function selectCustomTargetVpc(): Promise<string> {
  const vpcs = await handleOperation(() => getVpcs(), "Retrieving VPCs");

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
