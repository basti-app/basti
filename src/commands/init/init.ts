import { allowTargetAccess } from "./allow-target-access.js";
import { createBastion } from "./create-bastion.js";
import { selectBastionSubnet } from "./select-bastion-subnet.js";
import { selectInitTarget } from "./select-init-target.js";

export async function handleInit(): Promise<void> {
  const target = await selectInitTarget();
  const targetVpcId = await target.getVpcId();

  const bastionSubnet = await selectBastionSubnet(targetVpcId);

  const bastionInstance = await createBastion({
    vpcId: targetVpcId,
    subnetId: bastionSubnet.id,
  });

  await allowTargetAccess({ target, bastionInstance });
}
