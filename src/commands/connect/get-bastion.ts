import { Bastion } from "../../bastion/bastion.js";
import * as bastionOps from "../../bastion/get-bastion.js";

export interface GetBastionInput {
  bastionId: string;
}

export async function getBastion({
  bastionId,
}: GetBastionInput): Promise<Bastion> {
  const bastion = await bastionOps.getBastion({ bastionId });

  if (!bastion) {
    throw new Error(`Bastion instance not found`);
  }

  return bastion;
}
