import * as bastionOps from "../../../bastion/ensure-bastion-running.js";
import { Bastion } from "../../../bastion/bastion.js";
import { cli } from "../../../common/cli.js";

export interface EnsureBastionRunningInput {
  bastion: Bastion;
}

export async function ensureBastionRunning({
  bastion,
}: EnsureBastionRunningInput): Promise<void> {
  await bastionOps.ensureBastionRunning({
    bastion,
    hooks: {
      onWaitingInstanceToStart: () =>
        cli.progressStart(
          `Bastion instance is starting. Waiting instance to start`
        ),
      onWaitingInstanceToStop: () =>
        cli.progressStart(
          `Bastion instance is stopping. Waiting instance to stop`
        ),
      onStartingInstance: () =>
        cli.progressStart(
          `Bastion instance is stopped. Starting bastion instance`
        ),
      onInstanceStarted: () =>
        cli.progressSuccess(`Bastion instance is running`),
    },
  });
}
