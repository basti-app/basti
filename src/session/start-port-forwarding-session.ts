import { startSsmPortForwardingSession } from '../aws/ssm/start-session.js';
import { retry } from '../common/retry.js';
import { ConnectTarget } from '../target/connect-target.js';
import { AwsSsmInstanceNotConnectedError } from '../aws/ssm/ssm-client.js';
import { AwsSsmSessionDescriptor } from '../aws/ssm/types.js';

import { startBastionUsageMarker } from './start-bastion-usage-marker.js';
import { startSessionManagerPluginProcess } from './start-session-manager-plugin-process.js';

export interface StartPortForwardingSessionHooks {
  onSessionInterrupted?: (error: Error) => void;
  onMarkingError?: (error: unknown) => void;
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
  const stopUsageMarker = startBastionUsageMarker({
    bastionInstanceId,
    hooks: {
      onMarkingError: hooks?.onMarkingError,
    },
  });

  try {
    const targetHost = await target.getHost();
    const targetPort = await target.getPort();

    const sessionDescriptor = await startSessionWithRetries(
      bastionInstanceId,
      targetHost,
      targetPort,
      localPort
    );

    await startSessionManagerPluginProcess({
      sessionDescriptor,
      hooks: {
        onProcessExited: error => {
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

async function startSessionWithRetries(
  bastionInstanceId: string,
  targetHost: string,
  targetPort: number,
  localPort: number
): Promise<AwsSsmSessionDescriptor> {
  return await retry(
    async () =>
      await startSsmPortForwardingSession({
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
}

function isTargetNotConnectedError(error: unknown): boolean {
  return error instanceof AwsSsmInstanceNotConnectedError;
}
