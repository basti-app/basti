import { assertTargetIsInitialized } from "./assert-target-is-initialized.js";
import { ensureBastionRunning } from "./ensure-bastion-running.js";
import { getBastion } from "./get-bastion.js";
import { selectConnectTarget } from "./select-connect-target.js";
import { selectPort } from "./select-port.js";
import { startPortForwarding } from "./start-port-forwarding.js";

export async function handleConnect(): Promise<void> {
  const target = await selectConnectTarget();

  await assertTargetIsInitialized({ target });

  const bastion = await getBastion({ target });

  await ensureBastionRunning({ bastion });

  const localPort = await selectPort("Local port number");

  await startPortForwarding({
    bastionInstanceId: bastion.instance.id,
    target,
    localPort,
  });
}
