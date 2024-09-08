import type { ResourceType, TagSpecification } from '@aws-sdk/client-ec2';
import type { AwsTag } from '../types.js';

export function toTagSpecification(
  resourceType: string,
  tags: AwsTag[]
): TagSpecification {
  return {
    ResourceType: resourceType as ResourceType,
    Tags: tags.map(tag => ({
      Key: tag.key,
      Value: tag.value,
    })),
  };
}
