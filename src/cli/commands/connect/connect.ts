import { ensureBastionRunning } from "./ensure-bastion-running.js";
import { getBastion } from "./get-bastion.js";
import { selectConnectTarget } from "./select-connect-target.js";
import { selectLocalPort } from "./select-local-port.js";
import { startPortForwarding } from "./start-port-forwarding.js";

export async function handleConnect(): Promise<void> {
  const target = await selectConnectTarget();
  const localPort = await selectLocalPort();
  const bastionId = await target.getBastionId();

  const bastion = await getBastion({ bastionId });

  await ensureBastionRunning({ bastion });

  await startPortForwarding({
    bastionInstanceId: bastion.instance.id,
    target,
    localPort,
  });
}
