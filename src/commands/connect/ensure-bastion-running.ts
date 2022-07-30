import ora from "ora";

import * as bastion from "../../bastion/ensure-bastion-running.js";
import { BastionState } from "../../bastion/bastion.js";

export interface EnsureBastionRunningInput {
  bastionState: BastionState;
}

export async function ensureBastionRunning({
  bastionState,
}: EnsureBastionRunningInput): Promise<void> {
  const spinner = ora();

  await bastion.ensureBastionRunning({
    bastionState,
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
