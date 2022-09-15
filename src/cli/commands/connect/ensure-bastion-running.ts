import * as bastionOps from '../../../bastion/ensure-bastion-running.js';
import { Bastion } from '../../../bastion/bastion.js';
import { cli } from '../../../common/cli.js';
import { OperationError } from '../../error/operation-error.js';
import { detailProvider } from '../../error/get-error-detail.js';
import { AwsNoRootVolumeAttachedError } from '../../../aws/ec2/ec2-client.js';

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
        onStartingInstance: () =>
          cli.progressStart(
            `Bastion instance is stopped. Starting bastion instance`
          ),
        onInstanceStarted: () => cli.progressStop(),
      },
    });
  } catch (error) {
    cli.progressFailure();

    throw OperationError.from({
      operationName: 'Starting bastion instance',
      error,
      detailProviders: [
        detailProvider(
          bastionOps.StartingInstanceError,
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
