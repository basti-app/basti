import { z } from 'zod';

import type { Tag } from '@aws-sdk/client-ec2';
import type { AwsTags } from './types.js';

export const AwsTagParser = z.object({
  Key: z.string(),
  Value: z.string().optional(),
});

export function transformTags(tags?: Tag[]): AwsTags {
  if (!tags) {
    return {};
  }
  return Object.fromEntries(tags.map(tag => [tag.Key, tag.Value]));
}
