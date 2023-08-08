import { BASTION_INSTANCE_DEFAULT_INSTANCE_TYPE } from '#src/bastion/bastion.js';
import { cli } from '#src/common/cli.js';

export async function selectInstanceType(
  instanceTypeInput: string | undefined
): Promise<string> {
  if (instanceTypeInput !== undefined) {
    return instanceTypeInput;
  }

  const { instanceType } = await cli.prompt({
    type: 'input',
    name: 'instanceType',
    message: 'EC2 instance type',
    default: BASTION_INSTANCE_DEFAULT_INSTANCE_TYPE,
  });

  return instanceType;
}
