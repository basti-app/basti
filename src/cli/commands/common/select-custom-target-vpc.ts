import inquirer from "inquirer";
import { AwsAccessDeniedError } from "../../../aws/common/AwsError.js";
import { AwsVpc } from "../../../aws/ec2/types/aws-vpc.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { ExpectedError, UnexpectedError } from "../../error.js";
import * as vpcOps from "../../../aws/ec2/get-vpcs.js";

export async function selectCustomTargetVpc(): Promise<string> {
  const vpcs = await getVpcs();

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

async function getVpcs(): Promise<AwsVpc[]> {
  try {
    cli.progressStart("Retrieving VPCs");
    const vpcs = await vpcOps.getVpcs();
    cli.progressStop();
    return vpcs;
  } catch (error) {
    if (error instanceof AwsAccessDeniedError) {
      throw new ExpectedError("Failed to retrieve VPCs. Access denied by IAM");
    }
    throw new UnexpectedError("Failed to retrieve VPCs", error);
  }
}
