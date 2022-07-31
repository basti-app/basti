import { ConnectTarget } from "../../target/connect-target.js";

export interface StartPortForwardingInput {
  bastionInstanceId: string;
  target: ConnectTarget;
}

export async function startPortForwarding({
  bastionInstanceId,
  target,
}: StartPortForwardingInput): Promise<void> {
  console.log(
    `Forwarding ports to ${await target.getHost()}:${await target.getPort()} using bastion instance ${bastionInstanceId}`
  );
}
