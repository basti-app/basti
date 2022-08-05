import ora from "ora";

import { Bastion } from "../../bastion/bastion.js";
import * as bastionOps from "../../bastion/get-bastion.js";

export interface GetBastionInput {
  vpcId: string;
}

export async function getBastion({
  vpcId,
}: GetBastionInput): Promise<Bastion | undefined> {
  const spinner = ora();

  spinner.start(`Checking for an existing bastion in VPC: ${vpcId}`);
  const bastion = await bastionOps.getBastion({ vpcId });

  if (bastion) {
    spinner.succeed(`Bastion already exists: ${bastion.id}`);
  } else {
    spinner.succeed(`No existing bastion found`);
  }

  return bastion;
}
