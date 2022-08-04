import ora from "ora";

import { startPortForwardingSession } from "../../session/start-port-forwarding-session.js";
import { ConnectTarget } from "../../target/connect-target.js";

export interface StartPortForwardingInput {
  target: ConnectTarget;
  bastionInstanceId: string;
  localPort: number;
}

export async function startPortForwarding({
  target,
  bastionInstanceId,
  localPort,
}: StartPortForwardingInput): Promise<void> {
  const spinner = ora();

  await startPortForwardingSession({
    target,
    bastionInstanceId,
    localPort,
    hooks: {
      onStartingSession: () =>
        spinner.start("Starting port forwarding session"),
      onSessionStarted: () =>
        spinner.succeed(
          `Session started. Port ${localPort} is open for your connections 🚀`
        ),
      onSessionInterrupted: () => {
        console.log("Session was interrupted unexpectedly");
        process.exit(1);
      },
    },
  });
}
