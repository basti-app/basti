import { getSubnets } from '#src/aws/ec2/get-subnets.js';
import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';

import { EarlyExitError } from '../../error/early-exit-error.js';
import { handleOperation } from '../common/handle-operation.js';

export interface SelectBastionSubnetInput {
  vpcId: string;
  bastionSubnetInput?: string;
}

export async function selectBastionSubnetId({
  vpcId,
  bastionSubnetInput,
}: SelectBastionSubnetInput): Promise<string> {
  return bastionSubnetInput ?? (await promptForBastionSubnetId(vpcId));
}

async function promptForBastionSubnetId(vpcId: string): Promise<string> {
  const subnets = await handleOperation(
    'Retrieving VPC subnets',
    async () => await getSubnets({ vpcId })
  );

  if (subnets.length === 0) {
    throw new EarlyExitError(
      'No subnets found in the VPC. Vpc must have at least one public subnet for the bastion to be set up'
    );
  }

  const { subnet } = await cli.prompt({
    type: 'list',
    name: 'subnet',
    message:
      fmt.reset('Select ') +
      fmt.important('public') +
      fmt.reset(' subnet for the bastion'),
    choices: subnets.map(subnet => ({
      name: fmt.resourceName(subnet),
      value: subnet.id,
    })),
  });

  return subnet;
}
