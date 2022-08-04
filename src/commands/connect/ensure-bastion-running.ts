import ora from "ora";

import * as bastionOps from "../../bastion/ensure-bastion-running.js";
import { Bastion } from "../../bastion/bastion.js";

export interface EnsureBastionRunningInput {
  bastion: Bastion;
}

export async function ensureBastionRunning({
  bastion,
}: EnsureBastionRunningInput): Promise<void> {
  const spinner = ora();

  await bastionOps.ensureBastionRunning({
    bastion,
    hooks: {
      onWaitingInstanceToStart: () =>
        spinner.start(
          `Bastion instance is starting. Waiting instance to start`
        ),
      onWaitingInstanceToStop: () =>
        spinner.start(`Bastion instance is stopping. Waiting instance to stop`),
      onStartingInstance: () =>
        spinner.start(`Bastion instance is stopped. Starting bastion instance`),
      onInstanceStarted: () => spinner.succeed(`Bastion instance is running`),
    },
  });
}
