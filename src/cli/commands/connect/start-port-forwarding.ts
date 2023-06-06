import { AwsSsmInstanceNotConnectedError } from '#src/aws/ssm/ssm-errors.js';
import { EarlyExitError } from '#src/cli/error/early-exit-error.js';
import type {
  ChildProcessExitDescription,
  ChildProcessOutput,
} from '#src/common/child-process.js';
import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';
import {
  SessionManagerPluginExitError,
  SessionManagerPluginNonInstalledError,
  SessionManagerPluginPortInUseError,
  SessionManagerPluginTimeoutError,
} from '#src/session/session-errors.js';
import type { StartPortForwardingSessionHooks } from '#src/session/start-port-forwarding-session.js';
import { startPortForwardingSession } from '#src/session/start-port-forwarding-session.js';
import type { ConnectTarget } from '#src/target/connect-target.js';
import { retry } from '#src/common/retry.js';

import {
  detailProvider,
  getErrorDetail,
} from '../../error/get-error-detail.js';
import { OperationError } from '../../error/operation-error.js';

import type { DetailProvider } from '../../error/get-error-detail.js';

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
  try {
    cli.progressStart('Starting port forwarding session');

    await startPortForwardingSessionWithRetries(
      target,
      bastionInstanceId,
      localPort,
      {
        onSessionError: handleSessionError,
        onSessionEnded: handleSessionEnded,
        onMarkingError: handleMarkingError,
      }
    );

    cli.progressStop();
    cli.info(
      `Port ${fmt.value(String(localPort))} is open for your connections`,
      '🚀'
    );
  } catch (error) {
    cli.progressFailure();

    handleSessionStartError(error, localPort);
  }
}

async function startPortForwardingSessionWithRetries(
  target: ConnectTarget,
  bastionInstanceId: string,
  localPort: number,
  hooks: StartPortForwardingSessionHooks
): Promise<void> {
  await retry(
    async () =>
      await startPortForwardingSession({
        target,
        bastionInstanceId,
        localPort,
        hooks,
      }),
    {
      delay: 1000,
      maxRetries: 10,
      shouldRetry: error => error instanceof SessionManagerPluginTimeoutError,
    }
  );
}

function handleSessionEnded(
  exitDescription: ChildProcessExitDescription
): void {
  throw new EarlyExitError(
    'Port forwarding session ended. Please, check your AWS Session Manager time out settings',
    formatExitDescription(exitDescription)
  );
}

function handleSessionError(error: Error): never {
  throw OperationError.fromError({
    operationName: 'Running port forwarding session',
    error,
    detailProviders: [getSessionManagerExitDetailProvider()],
  });
}

function handleMarkingError(error: unknown): void {
  cli.warn(
    `Can't mark bastion usage.  ${getErrorDetail(
      error
    )}. This might lead to session interruption.`
  );
}

function handleSessionStartError(error: unknown, localPort: number): never {
  throw OperationError.fromError({
    operationName: 'Starting port forwarding session',
    error,
    detailProviders: [
      detailProvider(
        AwsSsmInstanceNotConnectedError,
        () =>
          `Bastion instance is not connected to SSM. The instance might have been created in a private VPC subnet during ${fmt.code(
            'basti init'
          )}`
      ),
      detailProvider(
        SessionManagerPluginNonInstalledError,
        () =>
          'session-manager-plugin was not installed automatically with Basti. You can install it manually following the official manual: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html'
      ),
      detailProvider(
        SessionManagerPluginPortInUseError,
        () => `Local port ${fmt.value(String(localPort))} is already in use`
      ),
      getSessionManagerExitDetailProvider(),
      detailProvider(SessionManagerPluginTimeoutError, error =>
        formatTimeoutError(error.output)
      ),
    ],
  });
}

function getSessionManagerExitDetailProvider(): DetailProvider {
  return detailProvider(SessionManagerPluginExitError, error => {
    return formatExitDescription(error.exitDescription);
  });
}

function formatExitDescription(
  exitDescription: ChildProcessExitDescription
): string {
  const output = formatOutput(exitDescription);
  if (typeof exitDescription.reason === 'number') {
    return `session-manager-plugin exited with code ${exitDescription.reason}${output}`;
  }
  return `session-manager-plugin exited due to ${exitDescription.reason} signal${output}`;
}

function formatTimeoutError(processOutput: ChildProcessOutput): string {
  const output = formatOutput(processOutput);
  return `session-manager-plugin did not start the port forwarding session${output}`;
}

function formatOutput(processOutput: ChildProcessOutput): string {
  const output =
    processOutput.output.length > 0
      ? `\n\nOutput:\n${processOutput.output.trim()}`
      : '';
  const errorOutput =
    processOutput.errorOutput.length > 0
      ? `\n\nError output:\n${processOutput.errorOutput.trim()}`
      : '';

  return `${output}${errorOutput}`;
}
