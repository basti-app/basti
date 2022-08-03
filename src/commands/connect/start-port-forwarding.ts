import ora from "ora";

import { startPortForwardingSession } from "../../session/start-port-forwarding-session.js";
import { ConnectTarget } from "../../target/connect-target.js";

export interface StartPortForwardingInput {
  target: ConnectTarget;
  bastionInstanceId: string;
}

export async function startPortForwarding({
  target,
  bastionInstanceId,
}: StartPortForwardingInput): Promise<void> {
  const spinner = ora();

  await startPortForwardingSession({
    target,
    bastionInstanceId,
    hooks: {
      onStartingSession: () =>
        spinner.start("Starting port forwarding session"),
      onSessionStarted: () =>
        spinner.succeed(
          `Session started. Port ${54321} is open for your connections 🚀`
        ),
      onSessionInterrupted: () => {
        console.log("Session was interrupted unexpectedly");
        process.exit(1);
      },
    },
  });
}
