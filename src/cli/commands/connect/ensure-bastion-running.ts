import * as bastionOps from '#src/bastion/ensure-bastion-running.js';
import { Bastion } from '#src/bastion/bastion.js';
import { cli } from '#src/common/cli.js';
import { AwsNoRootVolumeAttachedError } from '#src/aws/ec2/ec2-errors.js';
import { StartingInstanceError } from '#src/bastion/bastion-errors.js';

import { OperationError } from '../../error/operation-error.js';
import { detailProvider } from '../../error/get-error-detail.js';

export interface EnsureBastionRunningInput {
  bastion: Bastion;
}

export async function ensureBastionRunning({
  bastion,
}: EnsureBastionRunningInput): Promise<void> {
  try {
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
        onWaitingInstanceToUpdate: () =>
          cli.progressStart(
            `Bastion instance is updating. This may take a few minutes`
          ),
        onStartingInstance: () =>
          cli.progressStart(
            `Bastion instance is stopped. Starting bastion instance`
          ),
        onInstanceStarted: () => cli.progressStop(),
      },
    });
  } catch (error) {
    cli.progressFailure();

    throw OperationError.fromError({
      operationName: 'Starting bastion instance',
      error,
      detailProviders: [
        detailProvider(
          StartingInstanceError,
          error => `Can't start bastion instance ${error.instanceId}`
        ),
        detailProvider(
          AwsNoRootVolumeAttachedError,
          () => "Bastion instance doesn't have a volume attached at root"
        ),
      ],
    });
  }
}
