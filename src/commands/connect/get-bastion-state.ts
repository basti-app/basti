import { BastionState } from "../../bastion/bastion.js";
import * as bastion from "../../bastion/get-bastion-state.js";

export interface GetBastionStateInput {
  bastionId: string;
}

export async function getBastionState({
  bastionId,
}: GetBastionStateInput): Promise<BastionState> {
  const instanceState = await bastion.getBastionState({ bastionId });

  if (!instanceState) {
    throw new Error(`Bastion instance not found`);
  }

  return instanceState;
}
