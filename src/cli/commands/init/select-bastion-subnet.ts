import inquirer from "inquirer";
import { getSubnets } from "../../../aws/ec2/get-subnets.js";
import { AwsSubnet } from "../../../aws/ec2/types/aws-vpc.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { handleOperation } from "../common/handle-operation.js";

export interface SelectBastionSubnetInput {
  vpcId: string;
}

export async function selectBastionSubnet({
  vpcId,
}: SelectBastionSubnetInput): Promise<AwsSubnet> {
  const subnets = await handleOperation("retrieving VPC subnets", () =>
    getSubnets({ vpcId })
  );

  if (subnets.length === 0) {
    cli.error(`No subnets found in the VPC`);
    process.exit(0);
  }

  const { subnet } = await inquirer.prompt({
    type: "list",
    name: "subnet",
    message: "Select public network for the bastion",
    choices: subnets.map((subnet) => ({
      name: fmt.resourceName(subnet),
      value: subnet,
    })),
  });

  return subnet;
}
