import { allowTargetAccess } from './allow-target-access.js';
import { assertTargetIsNotInitialized } from './assert-target-is-not-initiated.js';
import { createBastion } from './create-bastion.js';
import { getBastion } from './get-bastion.js';
import { getTargetVpc } from './get-target-vpc.js';
import { selectBastionSubnetId } from './select-bastion-subnet.js';
import {
  DehydratedInitTargetInput,
  selectInitTarget,
} from './select-init-target.js';

export type InitCommandInput = {
  target?: DehydratedInitTargetInput;
  bastionSubnet?: string;
};

export async function handleInit(input: InitCommandInput): Promise<void> {
  const target = await selectInitTarget(input.target);
  const targetVpcId = await getTargetVpc(target);

  const bastionSubnet = await selectBastionSubnetId({
    vpcId: targetVpcId,
    bastionSubnetInput: input.bastionSubnet,
  });

  await assertTargetIsNotInitialized({ target });

  const bastion =
    (await getBastion({ vpcId: targetVpcId })) ||
    (await createBastion({ vpcId: targetVpcId, subnetId: bastionSubnet }));

  await allowTargetAccess({ target, bastion });
}
