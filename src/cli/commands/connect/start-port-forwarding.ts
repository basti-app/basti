import { AwsSsmInstanceNotConnectedError } from "../../../aws/ssm/ssm-client.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";

import { startPortForwardingSession } from "../../../session/start-port-forwarding-session.js";
import {
  SessionManagerPluginNonInstalledError,
  SessionManagerPluginPortInUseError,
  SessionManagerPluginUnexpectedExitError,
} from "../../../session/start-session-manager-plugin-process.js";
import { ConnectTarget } from "../../../target/connect-target.js";
import {
  detailProvider,
  getErrorDetail,
} from "../../error/get-error-detail.js";
import { OperationError } from "../../error/operation-error.js";

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
    cli.progressStart("Starting port forwarding session");

    await startPortForwardingSession({
      target,
      bastionInstanceId,
      localPort,
      hooks: {
        onSessionInterrupted: (error) => {
          throw OperationError.from({
            operationName: "running port forwarding session",
            error,
            detailProviders: [
              detailProvider(
                SessionManagerPluginUnexpectedExitError,
                (error) =>
                  `session-manager-plugin exited with code/signal: ${error.reason}\n\nOutput:\n${error.output}\n\nError output:\n${error.errorOutput}`
              ),
            ],
          });
        },
        onMarkingError: (error) => {
          cli.warn(
            `Can't mark bastion usage.  ${getErrorDetail(
              error
            )}. This might lead to session interruption.`
          );
        },
      },
    });

    cli.progressStop();
    cli.info(
      `Port ${fmt.value(String(localPort))} is open for your connections`,
      "🚀"
    );
  } catch (error) {
    cli.progressFailure();

    throw OperationError.from({
      operationName: "starting port forwarding session",
      error,
      detailProviders: [
        detailProvider(
          AwsSsmInstanceNotConnectedError,
          () =>
            `Bastion instance is not connected to SSM. The instance might have been created in a private VPC subnet during ${fmt.code(
              "basti init"
            )}`
        ),
        detailProvider(
          SessionManagerPluginNonInstalledError,
          () => "session-manager-plugin is not installed"
        ),
        detailProvider(
          SessionManagerPluginPortInUseError,
          () => `Local port ${fmt.value(String(localPort))} is already in use`
        ),
      ],
    });
  }
}
