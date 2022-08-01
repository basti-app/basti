import { startSessionManagerPlugin } from "../../aws/session-manager/start-session-manager-plugin.js";
import { startSsmPortForwardingSession } from "../../aws/ssm/start-session.js";
import { ConnectTarget } from "../../target/connect-target.js";

export interface StartPortForwardingInput {
  bastionInstanceId: string;
  target: ConnectTarget;
}

export async function startPortForwarding({
  bastionInstanceId,
  target,
}: StartPortForwardingInput): Promise<void> {
  const sessionDescriptor = await startSsmPortForwardingSession({
    bastionInstanceId,
    targetHost: await target.getHost(),
    targetPort: await target.getPort(),
  });

  await startSessionManagerPlugin({ sessionDescriptor });
}
