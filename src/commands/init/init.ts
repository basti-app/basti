import { selectBastionSubnet } from "./select-bastion-subnet.js";
import { selectInitTarget } from "./select-init-target.js";

export async function handleInit(): Promise<void> {
  const target = await selectInitTarget();
  const targetVpcId = await target.getVpcId();

  const bastionSubnet = await selectBastionSubnet(targetVpcId);

  console.log({ target, targetVpcId, bastionSubnet });
}
