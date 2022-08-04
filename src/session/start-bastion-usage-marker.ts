import { upsertTags } from "../aws/ec2/upsert-tags.js";
import { BASTION_INSTANCE_IN_USE_TAG_NAME } from "../bastion/bastion.js";

export interface StartBastionUsageMarkerInput {
  bastionInstanceId: string;
}

export function startBastionUsageMarker({
  bastionInstanceId,
}: StartBastionUsageMarkerInput): () => void {
  markBastionUsage(bastionInstanceId);
  const interval = setInterval(
    () => markBastionUsage(bastionInstanceId),
    60_000
  );

  return () => clearInterval(interval);
}

async function markBastionUsage(bastionInstanceId: string): Promise<void> {
  await upsertTags({
    resourceIds: [bastionInstanceId],
    tags: [
      {
        key: BASTION_INSTANCE_IN_USE_TAG_NAME,
        value: new Date().toISOString(),
      },
    ],
  });
}
