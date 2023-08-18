import { upsertTags } from '../aws/ec2/upsert-tags.js';
import { BASTION_INSTANCE_IN_USE_TAG_NAME } from '../bastion/bastion.js';

export interface StartBastionUsageMarkerHooks {
  onMarkingError?: (error: unknown) => void;
}

export interface StartBastionUsageMarkerInput {
  bastionInstanceId: string;
  hooks?: StartBastionUsageMarkerHooks;
}

export function startBastionUsageMarker({
  bastionInstanceId,
  hooks,
}: StartBastionUsageMarkerInput): () => void {
  void markBastionUsage(bastionInstanceId);
  const interval = setInterval(() => {
    void markBastionUsage(bastionInstanceId, hooks);
  }, 60_000);

  return () => clearInterval(interval);
}

async function markBastionUsage(
  bastionInstanceId: string,
  hooks?: StartBastionUsageMarkerHooks
): Promise<void> {
  try {
    await upsertTags({
      resourceIds: [bastionInstanceId],
      tags: [
        {
          key: BASTION_INSTANCE_IN_USE_TAG_NAME,
          value: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    hooks?.onMarkingError?.(error);
  }
}
