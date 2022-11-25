import { AwsSsmInstanceNotConnectedError } from '#src/aws/ssm/ssm-errors.js';
import { EarlyExitError } from '#src/cli/error/early-exit-error.js';
import { ChildProcessExitDescription } from '#src/common/child-process.js';
import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';
import {
  SessionManagerPluginExitError,
  SessionManagerPluginNonInstalledError,
  SessionManagerPluginPortInUseError,
} from '#src/session/session-errors.js';
import { startPortForwardingSession } from '#src/session/start-port-forwarding-session.js';
import { ConnectTarget } from '#src/target/connect-target.js';

import {
  DetailProvider,
  detailProvider,
  getErrorDetail,
} from '../../error/get-error-detail.js';
import { OperationError } from '../../error/operation-error.js';

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

    await startPortForwardingSession({
      target,
      bastionInstanceId,
      localPort,
      hooks: {
        onSessionError: handleSessionError,
        onSessionEnded: handleSessionEnded,
        onMarkingError: handleMarkingError,
      },
    });

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

function handleSessionEnded(
  exitDescription: ChildProcessExitDescription
): void {
  throw new EarlyExitError(
    'Port forwarding session ended. Please, check your AWS Session Manager time out settings',
    formatExitDescription(exitDescription)
  );
}

function handleSessionError(error: Error): never {
  throw OperationError.from({
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
  throw OperationError.from({
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
  const output =
    exitDescription.output.length > 0
      ? `\n\nOutput:\n${exitDescription.output.trim()}`
      : '';
  const errorOutput =
    exitDescription.errorOutput.length > 0
      ? `\n\nError output:\n${exitDescription.errorOutput.trim()}`
      : '';

  if (typeof exitDescription.reason === 'number') {
    return `session-manager-plugin exited with code ${exitDescription.reason}${output}${errorOutput}`;
  }
  return `session-manager-plugin exited due to ${exitDescription.reason} signal`;
}
