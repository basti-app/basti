import { AwsAccessDeniedError } from "../../../aws/common/AwsError.js";
import { cli } from "../../../common/cli.js";
import { InitTarget } from "../../../target/init-target.js";
import { ExpectedError, UnexpectedError } from "../../error.js";
import { allowTargetAccess } from "./allow-target-access.js";
import { assertTargetIsNotInitialized } from "./assert-target-is-not-initiated.js";
import { createBastion } from "./create-bastion.js";
import { getBastion } from "./get-bastion.js";
import { selectBastionSubnet } from "./select-bastion-subnet.js";
import { selectInitTarget } from "./select-init-target.js";

export async function handleInit(): Promise<void> {
  const target = await selectInitTarget();

  await assertTargetIsNotInitialized({ target });

  const targetVpcId = await getTargetVpcId(target);

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

async function getTargetVpcId(target: InitTarget): Promise<string> {
  try {
    cli.progressStart("Retrieving target VPC id");
    const vpcId = await target.getVpcId();
    cli.progressStop();
    return vpcId;
  } catch (error) {
    if (error instanceof AwsAccessDeniedError) {
      throw new ExpectedError(
        "Failed to retrieve target VPC id. Access denied by IAM"
      );
    }
    throw new UnexpectedError("Failed to retrieve target VPC id", error);
  }
}
