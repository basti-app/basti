import { allowTargetAccess } from "./allow-target-access.js";
import { createBastion } from "./create-bastion.js";
import { assertBastionDoesNotExist } from "./ensure-bastion-does-not-exist.js";
import { selectBastionSubnet } from "./select-bastion-subnet.js";
import { selectInitTarget } from "./select-init-target.js";

export async function handleInit(): Promise<void> {
  const target = await selectInitTarget();
  const targetVpcId = await target.getVpcId();

  await assertBastionDoesNotExist({ vpcId: targetVpcId });

  const bastionSubnet = await selectBastionSubnet(targetVpcId);

  const bastionInstance = await createBastion({
    vpcId: targetVpcId,
    subnetId: bastionSubnet.id,
  });

  await allowTargetAccess({ target, bastionInstance });
}
