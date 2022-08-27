import ora from "ora";
import { cli } from "../../../common/cli.js";

import { startPortForwardingSession } from "../../../session/start-port-forwarding-session.js";
import { ConnectTarget } from "../../../target/connect-target.js";

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
  await startPortForwardingSession({
    target,
    bastionInstanceId,
    localPort,
    hooks: {
      onStartingSession: () =>
        cli.progressStart("Initializing port forwarding session"),
      onSessionStarted: () => {
        cli.progressStop();
        cli.info(`Port ${localPort} is open for your connections`, "🚀");
      },
      onSessionInterrupted: () => {
        cli.error("Session was interrupted unexpectedly");
        process.exit(1);
      },
    },
  });
}
