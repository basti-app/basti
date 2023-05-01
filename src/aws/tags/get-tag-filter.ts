import type { Filter } from '@aws-sdk/client-ec2';
import type { AwsTag } from './types.js';

export function getTagFilter(tag: AwsTag): Filter {
  return {
    Name: `tag:${tag.key}`,
    Values: [tag.value],
  };
}
