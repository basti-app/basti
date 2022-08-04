import { startEc2Instance } from "../aws/ec2/start-ec2-instance.js";
import {
  waitEc2InstanceIsRunning,
  waitEc2InstanceIsStopped,
} from "../aws/ec2/wait-ec2-instance.js";
import { Bastion } from "./bastion.js";

export interface EnsureBastionRunningInput {
  bastion: Bastion;
  hooks?: {
    onWaitingInstanceToStart?: () => void;
    onWaitingInstanceToStop?: () => void;
    onStartingInstance?: () => void;
    onInstanceStarted?: () => void;
  };
}

export async function ensureBastionRunning({
  bastion,
  hooks,
}: EnsureBastionRunningInput): Promise<void> {
  const { instance } = bastion;

  switch (instance.state) {
    case "running":
      hooks?.onInstanceStarted?.();
      return;

    case "pending":
      hooks?.onWaitingInstanceToStart?.();
      await waitEc2InstanceIsRunning({ instanceId: instance.id });
      hooks?.onInstanceStarted?.();
      return;

    case "stopping":
      hooks?.onWaitingInstanceToStop?.();
      await waitEc2InstanceIsStopped({ instanceId: instance.id });

    case "stopped":
      hooks?.onStartingInstance?.();
      await startEc2Instance({ instanceId: instance.id });
      hooks?.onInstanceStarted?.();
      return;

    default:
      throw new Error(`Unexpected instance state ${instance.state}`);
  }
}
