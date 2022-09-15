import { CreateTagsCommand } from '@aws-sdk/client-ec2';
import { AwsTag } from '../tags/types.js';
import { ec2Client } from './ec2-client.js';

export interface UpsertTagsInput {
  resourceIds: string[];
  tags: AwsTag[];
}

export async function upsertTags({
  resourceIds,
  tags,
}: UpsertTagsInput): Promise<void> {
  await ec2Client.send(
    new CreateTagsCommand({
      Resources: resourceIds,
      Tags: tags.map(tag => ({ Key: tag.key, Value: tag.value })),
    })
  );
}
