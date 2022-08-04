import { SSMServiceException } from "@aws-sdk/client-ssm";
import { startSessionManagerPlugin } from "./start-session-manager-plugin.js";
import { startSsmPortForwardingSession } from "../aws/ssm/start-session.js";
import { retry } from "../common/retry.js";
import { ConnectTarget } from "../target/connect-target.js";
import { startBastionUsageMarker } from "./start-bastion-usage-marker.js";

export interface StartPortForwardingSessionInput {
  target: ConnectTarget;
  bastionInstanceId: string;
  localPort: number;
  hooks?: {
    onStartingSession?: () => void;
    onSessionStarted?: () => void;
    onSessionInterrupted?: () => void;
  };
}

export async function startPortForwardingSession({
  target,
  bastionInstanceId,
  localPort,
  hooks,
}: StartPortForwardingSessionInput): Promise<void> {
  const targetHost = await target.getHost();
  const targetPort = await target.getPort();

  hooks?.onStartingSession?.();
  const sessionDescriptor = await retry(
    () =>
      startSsmPortForwardingSession({
        bastionInstanceId,
        targetHost,
        targetPort,
        localPort,
      }),
    {
      delay: 3000,
      maxRetries: 20,
      shouldRetry: isTargetNotConnectedError,
    }
  );

  const stopUsageMarker = startBastionUsageMarker({ bastionInstanceId });

  await startSessionManagerPlugin({
    sessionDescriptor,
    hooks: {
      onPortOpened: hooks?.onSessionStarted,
      onProcessExited: () => {
        stopUsageMarker();
        hooks?.onSessionInterrupted?.();
      },
    },
  });
}

function isTargetNotConnectedError(error: unknown): boolean {
  return (
    error instanceof SSMServiceException &&
    error.message.toLocaleLowerCase().includes("not connected")
  );
}
