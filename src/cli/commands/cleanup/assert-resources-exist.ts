import { ManagedResources } from '#src/cleanup/managed-resources.js';
import { EarlyExitError } from '#src/cli/error/early-exit-error.js';

export interface AssertResourcesExistInput {
  resources: ManagedResources;
}

export function assertResourcesExist({
  resources,
}: AssertResourcesExistInput): void {
  if (isEmpty(resources)) {
    throw new EarlyExitError(
      'No Basti-managed resources found in your account'
    );
  }
}

function isEmpty(resources: ManagedResources): boolean {
  return Object.values(resources).every(group => group.length === 0);
}
