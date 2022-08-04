import { ensureBastionRunning } from "./ensure-bastion-running.js";
import { getBastionState } from "./get-bastion-state.js";
import { selectConnectTarget } from "./select-connect-target.js";
import { selectLocalPort } from "./select-local-port.js";
import { startPortForwarding } from "./start-port-forwarding.js";

export async function handleConnect(): Promise<void> {
  const target = await selectConnectTarget();
  const localPort = await selectLocalPort();
  const bastionId = await target.getBastionId();

  const bastionState = await getBastionState({ bastionId });

  await ensureBastionRunning({ bastionState });

  await startPortForwarding({
    bastionInstanceId: bastionState.instance.id,
    target,
    localPort,
  });
}
