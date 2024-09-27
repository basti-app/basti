import { BASTION_INSTANCE_DEFAULT_ASSIGN_PUBLIC_IP } from '#src/bastion/bastion.js';
import { cli } from '#src/common/cli.js';

export async function selectAssignPublicIp(
  assignPublicIpInput: boolean | undefined
): Promise<boolean> {
  if (assignPublicIpInput !== undefined) {
    return assignPublicIpInput;
  }

  const { assignPublicIp } = await cli.prompt({
    type: 'confirm',
    name: 'assignPublicIp',
    message: 'Assign a public IP to the bastion?',
    default: BASTION_INSTANCE_DEFAULT_ASSIGN_PUBLIC_IP,
  });

  return assignPublicIp;
}
