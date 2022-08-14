import { Bastion } from "../../bastion/bastion.js";
import * as bastionOps from "../../bastion/get-bastion.js";
import { cli } from "../../common/cli.js";

export interface GetBastionInput {
  vpcId: string;
}

export async function getBastion({
  vpcId,
}: GetBastionInput): Promise<Bastion | undefined> {
  cli.progressStart(`Checking for an existing bastion in VPC: ${vpcId}`);
  const bastion = await bastionOps.getBastion({ vpcId });

  if (bastion) {
    cli.progressSuccess(`Bastion already exists: ${bastion.id}`);
  } else {
    cli.progressSuccess(`No existing bastion found`);
  }

  return bastion;
}
