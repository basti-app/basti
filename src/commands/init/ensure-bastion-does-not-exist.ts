import { getBastion } from "../../bastion/get-bastion.js";

export interface AssertBastionDoesNotExist {
  vpcId: string;
}

export async function assertBastionDoesNotExist({
  vpcId,
}: AssertBastionDoesNotExist): Promise<void> {
  const bastion = await getBastion({ vpcId });

  if (bastion) {
    console.log(`Bastion instance "${bastion.instance.name}" already exists.`);
    process.exit(1);
  }
}
