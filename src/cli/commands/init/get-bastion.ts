import { Bastion } from '../../../bastion/bastion.js';
import * as bastionOps from '../../../bastion/get-bastion.js';
import { cli } from '../../../common/cli.js';
import { handleOperation } from '../common/handle-operation.js';

export interface GetBastionInput {
  vpcId: string;
}

export async function getBastion({
  vpcId,
}: GetBastionInput): Promise<Bastion | undefined> {
  const bastion = await handleOperation(
    'Checking for an existing bastion',
    async () => await bastionOps.getBastion({ vpcId })
  );

  if (bastion) {
    cli.progressSuccess(`Bastion already exists: ${bastion.id}`);
  }

  return bastion;
}
