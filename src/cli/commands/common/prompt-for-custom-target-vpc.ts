import { getVpcs } from '../../../aws/ec2/get-vpcs.js';
import { cli } from '../../../common/cli.js';
import { fmt } from '../../../common/fmt.js';
import { EarlyExitError } from '../../error/early-exit-error.js';
import { handleOperation } from './handle-operation.js';

export async function promptForCustomTargetVpc(): Promise<string> {
  const vpcs = await handleOperation(
    'Retrieving VPCs',
    async () => await getVpcs()
  );

  if (vpcs.length === 0) {
    throw new EarlyExitError(`No VPCs found in your account`);
  }

  const { vpcId } = await cli.prompt({
    type: 'list',
    name: 'vpcId',
    message: 'Select target VPC',
    choices: vpcs.map(vpc => ({
      name: fmt.resourceName(vpc),
      value: vpc.id,
    })),
  });

  return vpcId;
}
