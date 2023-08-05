import { allowTargetAccess } from './allow-target-access.js';
import { assertTargetIsNotInitialized } from './assert-target-is-not-initiated.js';
import { createBastion } from './create-bastion.js';
import { getBastion } from './get-bastion.js';
import { getTargetVpc } from './get-target-vpc.js';
import { selectBastionSubnetId } from './select-bastion-subnet.js';
import { selectInitTarget } from './select-init-target.js';
import { selectAdvancedInput } from './advanced-input/select-advanced-input.js';

import type { InitCommandInput } from './init-command-input.js';

export async function handleInit(input: InitCommandInput): Promise<void> {
  const target = await selectInitTarget(input.target);
  const targetVpcId = await getTargetVpc(target);

  const bastionSubnet = await selectBastionSubnetId({
    vpcId: targetVpcId,
    bastionSubnetInput: input.bastionSubnet,
  });

  const advancedInput = await selectAdvancedInput(input);

  await assertTargetIsNotInitialized({ target });

  const bastion =
    (await getBastion({ vpcId: targetVpcId })) ??
    (await createBastion({
      vpcId: targetVpcId,
      subnetId: bastionSubnet,
      tags: advancedInput.tags,
    }));

  await allowTargetAccess({ target, bastion, tags: advancedInput.tags });
}
