import { handleOperation } from "../common/handle-operation.js";
import { allowTargetAccess } from "./allow-target-access.js";
import { assertTargetIsNotInitialized } from "./assert-target-is-not-initiated.js";
import { createBastion } from "./create-bastion.js";
import { getBastion } from "./get-bastion.js";
import { selectBastionSubnet } from "./select-bastion-subnet.js";
import { selectInitTarget } from "./select-init-target.js";

export async function handleInit() {
  const target = await selectInitTarget();

  await assertTargetIsNotInitialized({ target });

  const targetVpcId = await handleOperation("retrieving target VPC", () =>
    target.getVpcId()
  );

  let bastion = await getBastion({ vpcId: targetVpcId });

  if (!bastion) {
    const bastionSubnet = await selectBastionSubnet({ vpcId: targetVpcId });

    bastion = await createBastion({
      vpcId: targetVpcId,
      subnetId: bastionSubnet.id,
    });
  }

  await allowTargetAccess({ target, bastion });
}
