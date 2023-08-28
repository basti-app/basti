import { assertTargetIsInitialized } from './assert-target-is-initialized.js';
import { ensureBastionRunning } from './ensure-bastion-running.js';
import { getBastion } from './get-bastion.js';
import { selectConnectTarget } from './select-connect-target.js';
import { selectPort } from './select-port.js';
import { startPortForwarding } from './start-port-forwarding.js';

import type { DehydratedConnectTargetInput } from './select-connect-target.js';

export interface ConnectCommandInput {
  target?: DehydratedConnectTargetInput;
  localPort?: number;
}

export async function handleConnect(input: ConnectCommandInput): Promise<void> {
  const target = await selectConnectTarget(input.target);

  const localPort = input.localPort ?? (await selectPort('Local port number'));

  await assertTargetIsInitialized({ target });

  const bastion = await getBastion({ target });

  await ensureBastionRunning({ bastion });

  await startPortForwarding({
    bastionInstanceId: bastion.instance.id,
    target,
    localPort,
  });
}
