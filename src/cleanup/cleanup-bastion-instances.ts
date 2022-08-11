import { terminateEc2Instances } from "../aws/ec2/terminate-ec2-instances.js";

interface CleanupBastionInstanceHooks {
  onCleaningUpBastionInstance?: (instanceId: string) => void;
  onBastionInstanceCleanedUp?: (instanceId: string) => void;
  onBastionInstanceCleanupFailed?: (instanceId: string) => void;
}

export interface CleanupBastionInstancesInput {
  instanceIds: string[];
  hooks?: CleanupBastionInstanceHooks;
}

export async function cleanupBastionInstances({
  instanceIds,
  hooks,
}: CleanupBastionInstancesInput): Promise<void> {
  for (const instanceId of instanceIds) {
    await cleanupBastionInstance(instanceId, hooks);
  }
}

async function cleanupBastionInstance(
  instanceId: string,
  hooks?: CleanupBastionInstanceHooks
): Promise<void> {
  try {
    hooks?.onCleaningUpBastionInstance?.(instanceId);

    await terminateEc2Instances({ instanceIds: [instanceId] });

    hooks?.onBastionInstanceCleanedUp?.(instanceId);
  } catch (error) {
    hooks?.onBastionInstanceCleanupFailed?.(instanceId);
  }
}
