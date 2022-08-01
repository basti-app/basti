import { spawn } from "child_process";

import { AwsSsmSessionDescriptor } from "../ssm/types.js";

export interface StartSessionManagerPluginInput {
  sessionDescriptor: AwsSsmSessionDescriptor;
}

export async function startSessionManagerPlugin({
  sessionDescriptor,
}: StartSessionManagerPluginInput): Promise<void> {
  // Session Manager Plugin arguments could be found here:
  // https://github.com/aws/session-manager-plugin/blob/916aa5c1c241967baaf20a0f3edcde44a45e4dfb/src/sessionmanagerplugin/session/session.go#L162
  const sessionManagerArgs = [
    JSON.stringify(sessionDescriptor.response),
    sessionDescriptor.region,
    "StartSession",
    "", // AWS CLI profile
    JSON.stringify(sessionDescriptor.request),
    sessionDescriptor.endpoint,
  ];

  process.stdin.pause();
  const sessionManagerProcess = spawn(
    "session-manager-plugin",
    sessionManagerArgs,
    { stdio: "inherit" }
  );
  sessionManagerProcess.on("exit", function () {
    process.stdin.resume();
  });
}
