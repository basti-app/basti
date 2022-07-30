import { getEc2Instances } from "../aws/ec2/get-ec2-instances.js";
import { BastionState, BASTION_INSTANCE_ID_TAG_NAME } from "./bastion.js";

export interface GetBastionStateInput {
  bastionId: string;
}

export async function getBastionState({
  bastionId,
}: GetBastionStateInput): Promise<BastionState | undefined> {
  const [instance] = await getEc2Instances({
    tags: [
      {
        key: BASTION_INSTANCE_ID_TAG_NAME,
        value: bastionId,
      },
    ],
  });

  return (
    instance && {
      id: bastionId,
      instance,
    }
  );
}
