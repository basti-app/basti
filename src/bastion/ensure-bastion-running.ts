import { AwsNoRootVolumeAttachedError } from '../aws/ec2/ec2-client.js';
import { startEc2Instance } from '../aws/ec2/start-ec2-instance.js';
import { AwsEc2Instance } from '../aws/ec2/types/aws-ec2-instance.js';
import {
  waitEc2InstanceIsRunning,
  waitEc2InstanceIsStopped,
} from '../aws/ec2/wait-ec2-instance.js';
import { RuntimeError, UnexpectedStateError } from '../common/runtime-error.js';
import { Bastion } from './bastion.js';

interface EnsureBastionRunningHooks {
  onWaitingInstanceToStart?: () => void;
  onWaitingInstanceToStop?: () => void;
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
  const { instance } = bastion;

  switch (instance.state) {
    case 'running':
      hooks?.onInstanceStarted?.();
      return;

    case 'pending':
      hooks?.onWaitingInstanceToStart?.();
      await waitEc2InstanceIsRunning({ instanceId: instance.id });
      hooks?.onInstanceStarted?.();
      return;

    case 'stopping':
      hooks?.onWaitingInstanceToStop?.();
      await waitEc2InstanceIsStopped({ instanceId: instance.id });

    case 'stopped':
      hooks?.onStartingInstance?.();
      await startInstance(instance);
      hooks?.onInstanceStarted?.();
      return;

    default:
      throw new Error(`Unexpected instance state ${instance.state}`);
  }
}
async function startInstance(instance: AwsEc2Instance) {
  try {
    await startEc2Instance({ instanceId: instance.id });
  } catch (error) {
    if (error instanceof AwsNoRootVolumeAttachedError) {
      error = new UnexpectedStateError(error);
    }
    throw new StartingInstanceError(instance.id, error);
  }
}

export class StartingInstanceError extends RuntimeError {
  readonly instanceId: string;

  constructor(instanceId: string, cause: unknown) {
    super(`Can't start bastion instance "${instanceId}"`, cause);
    this.instanceId = instanceId;
  }
}
