import { AwsNoRootVolumeAttachedError } from '../aws/ec2/ec2-errors.js';
import { startEc2Instance } from '../aws/ec2/start-ec2-instance.js';
import {
  waitEc2InstanceIsRunning,
  waitEc2InstanceIsStopped,
} from '../aws/ec2/wait-ec2-instance.js';
import { UnexpectedStateError } from '../common/runtime-errors.js';

import { StartingInstanceError } from './bastion-errors.js';

import type { AwsEc2Instance } from '../aws/ec2/types/aws-ec2-instance.js';
import type { Bastion } from './bastion.js';

interface EnsureBastionRunningHooks {
  onWaitingInstanceToStart?: () => void;
  onWaitingInstanceToStop?: () => void;
  onWaitingInstanceToUpdate?: () => void;
  onStartingInstance?: () => void;
  onInstanceStarted?: () => void;
}

export interface EnsureBastionRunningInput {
  bastion: Bastion;
  hooks?: EnsureBastionRunningHooks;
}

export async function ensureBastionRunning({
  bastion,
  hooks,
}: EnsureBastionRunningInput): Promise<void> {
  const { instance, state } = bastion;

  switch (state) {
    case 'running':
      hooks?.onInstanceStarted?.();
      return;

    case 'pending':
      hooks?.onWaitingInstanceToStart?.();
      await waitEc2InstanceIsRunning({ instanceId: instance.id });
      hooks?.onInstanceStarted?.();
      return;

    case 'updating':
      hooks?.onWaitingInstanceToUpdate?.();
      await waitEc2InstanceIsStopped({ instanceId: instance.id });

    // eslint-disable-next-line no-fallthrough
    case 'stopping':
      hooks?.onWaitingInstanceToStop?.();
      await waitEc2InstanceIsStopped({ instanceId: instance.id });

    // eslint-disable-next-line no-fallthrough
    case 'stopped':
      hooks?.onStartingInstance?.();
      await startInstance(instance);
      hooks?.onInstanceStarted?.();
      return;

    default:
      throw new Error(`Unexpected instance state ${instance.state}`);
  }
}

async function startInstance(instance: AwsEc2Instance): Promise<void> {
  try {
    await startEc2Instance({ instanceId: instance.id });
  } catch (error) {
    if (error instanceof AwsNoRootVolumeAttachedError) {
      error = new UnexpectedStateError(error);
    }
    throw new StartingInstanceError(instance.id, error);
  }
}
