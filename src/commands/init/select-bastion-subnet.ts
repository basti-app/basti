import inquirer from "inquirer";
import { getSubnets } from "../../aws/ec2/get-subnets.js";
import { AwsSubnet } from "../../aws/ec2/types/aws-vpc.js";
import { formatName } from "../../common/format-name.js";

export interface SelectBastionSubnetInput {
  vpcId: string;
}

export async function selectBastionSubnet({
  vpcId,
}: SelectBastionSubnetInput): Promise<AwsSubnet> {
  const subnets = await getSubnets({ vpcId });

  const { subnet } = await inquirer.prompt({
    type: "list",
    name: "subnet",
    message: "Select public network for the bastion",
    choices: subnets.map((subnet) => ({
      name: formatName(subnet),
      value: subnet,
    })),
  });

  return subnet;
}
