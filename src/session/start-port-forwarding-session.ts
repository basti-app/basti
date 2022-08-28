import { startSessionManagerPluginProcess } from "./start-session-manager-plugin-process.js";
import { startSsmPortForwardingSession } from "../aws/ssm/start-session.js";
import { retry } from "../common/retry.js";
import { ConnectTarget } from "../target/connect-target.js";
import { startBastionUsageMarker } from "./start-bastion-usage-marker.js";
import { AwsSsmInstanceNotConnectedError } from "../aws/ssm/ssm-client.js";

interface StartPortForwardingSessionHooks {
  onSessionInterrupted?: (error: Error) => void;
}

export interface StartPortForwardingSessionInput {
  target: ConnectTarget;
  bastionInstanceId: string;
  localPort: number;
  hooks?: StartPortForwardingSessionHooks;
}

export async function startPortForwardingSession({
  target,
  bastionInstanceId,
  localPort,
  hooks,
}: StartPortForwardingSessionInput): Promise<void> {
  const stopUsageMarker = startBastionUsageMarker({ bastionInstanceId });

  try {
    const targetHost = await target.getHost();
    const targetPort = await target.getPort();

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
        maxRetries: 30,
        shouldRetry: isTargetNotConnectedError,
      }
    );

    await startSessionManagerPluginProcess({
      sessionDescriptor,
      hooks: {
        onProcessExited: (error) => {
          stopUsageMarker();
          hooks?.onSessionInterrupted?.(error);
        },
      },
    });
  } catch (error) {
    stopUsageMarker();
    throw error;
  }
}

function isTargetNotConnectedError(error: unknown): boolean {
  return error instanceof AwsSsmInstanceNotConnectedError;
}
