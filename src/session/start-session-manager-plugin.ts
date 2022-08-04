import { spawn } from "child_process";

import { AwsSsmSessionDescriptor } from "../aws/ssm/types.js";

export interface StartSessionManagerPluginInput {
  sessionDescriptor: AwsSsmSessionDescriptor;
  hooks?: {
    onPortOpened?: () => void;
    onProcessExited?: () => void;
  };
}

export async function startSessionManagerPlugin({
  sessionDescriptor,
  hooks,
}: StartSessionManagerPluginInput): Promise<void> {
  // Session Manager Plugin arguments could be found here:
  // https://github.com/aws/session-manager-plugin/blob/916aa5c1c241967baaf20a0f3edcde44a45e4dfb/src/sessionmanagerplugin/session/session.go#L162
  const args = [
    JSON.stringify(sessionDescriptor.response),
    sessionDescriptor.region,
    "StartSession",
    "", // AWS CLI profile
    JSON.stringify(sessionDescriptor.request),
    sessionDescriptor.endpoint,
  ];

  const sessionManager = spawn("session-manager-plugin", args, {
    stdio: "pipe",
  });

  sessionManager.stdout.on(
    "data",
    (data) => isPortOpened(data) && hooks?.onPortOpened?.()
  );
  sessionManager.on("exit", () => hooks?.onProcessExited?.());

  return new Promise((resolve, reject) => {
    sessionManager.on("spawn", resolve);
    sessionManager.on("error", reject);
  });
}

function isPortOpened(data: Buffer | string): boolean {
  const dataString = data instanceof Buffer ? data.toString() : data;

  return dataString.toLowerCase().includes("waiting for connection");
}
