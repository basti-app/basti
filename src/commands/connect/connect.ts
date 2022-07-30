import { ensureBastionRunning } from "./ensure-bastion-running.js";
import { getBastionState } from "./get-bastion-state.js";
import { selectConnectTarget } from "./select-connect-target.js";

export async function handleConnect(): Promise<void> {
  const target = await selectConnectTarget();
  const bastionId = await target.getBastionId();

  const bastionState = await getBastionState({ bastionId });

  await ensureBastionRunning({ bastionState });
}
