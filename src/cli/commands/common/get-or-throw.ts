import { ResourceType } from '#src/common/resource-type.js';
import { ResourceNotFoundError } from '#src/common/runtime-errors.js';

export async function orThrow<T>(
  getter: () => Promise<T | undefined>,
  resourceType: ResourceType,
  resourceId: string
): Promise<T> {
  const value = await getter();
  if (!value) {
    throw new ResourceNotFoundError(resourceType, resourceId);
  }
  return value;
}
