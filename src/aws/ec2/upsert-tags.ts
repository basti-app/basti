import { CreateTagsCommand } from '@aws-sdk/client-ec2';

import { ec2Client } from './ec2-client.js';

import type { AwsTag } from '../tags/types.js';

export interface UpsertTagsInput {
  resourceIds: string[];
  tags: AwsTag[];
}

export async function upsertTags({
  resourceIds,
  tags,
}: UpsertTagsInput): Promise<void> {
  if (resourceIds.length === 0 || tags.length === 0) {
    return;
  }

  await ec2Client.send(
    new CreateTagsCommand({
      Resources: resourceIds,
      Tags: tags.map(tag => ({ Key: tag.key, Value: tag.value })),
    })
  );
}
