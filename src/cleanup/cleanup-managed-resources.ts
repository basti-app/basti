import { getErrorMessage } from "../common/get-error-message.js";
import { bastionInstanceCleaner } from "./bastion-instance-cleaner.js";
import { bastionInstanceProfileCleaner } from "./bastion-instance-profile-cleaner.js";
import { bastionRoleCleaner } from "./bastion-role-cleaner.js";
import {
  BatchCleanupError,
  BatchResourceCleaner,
  ManagedResourcesCleanupErrors,
  ResourceCleaner,
  ResourceCleanupError,
} from "./cleanup-errors.js";
import {
  ManagedResourceGroup,
  ManagedResourceGroups,
  ManagedResources,
} from "./managed-resources.js";
import {
  accessSecurityGroupReferencesCleaner,
  securityGroupCleaner,
} from "./security-group-cleaner.js";

interface CleanupManagedResourcesHooks {
  onCleaningUpResource?: (
    resourceGroup: ManagedResourceGroup,
    resourceId: string
  ) => void;
  onResourceCleanedUp?: (
    resourceGroup: ManagedResourceGroup,
    resourceId: string
  ) => void;
  onResourceCleanupFailed?: (
    resourceGroup: ManagedResourceGroup,
    resourceId: string
  ) => void;
}

export interface CleanupManagedResourcesInput {
  managedResources: ManagedResources;
  hooks?: CleanupManagedResourcesHooks;
}

const RESOURCE_CLEANERS: Record<ManagedResourceGroup, ResourceCleaner> = {
  [ManagedResourceGroup.ACCESS_SECURITY_GROUP]: securityGroupCleaner,
  [ManagedResourceGroup.BASTION_SECURITY_GROUP]: securityGroupCleaner,
  [ManagedResourceGroup.BASTION_INSTANCE]: bastionInstanceCleaner,
  [ManagedResourceGroup.BASTION_INSTANCE_PROFILE]:
    bastionInstanceProfileCleaner,
  [ManagedResourceGroup.BASTION_ROLE]: bastionRoleCleaner,
};

const BATCH_CLEANERS: Record<
  ManagedResourceGroup,
  BatchResourceCleaner | undefined
> = {
  [ManagedResourceGroup.ACCESS_SECURITY_GROUP]:
    accessSecurityGroupReferencesCleaner,
  [ManagedResourceGroup.BASTION_SECURITY_GROUP]: undefined,
  [ManagedResourceGroup.BASTION_INSTANCE]: undefined,
  [ManagedResourceGroup.BASTION_INSTANCE_PROFILE]: undefined,
  [ManagedResourceGroup.BASTION_ROLE]: undefined,
};

export async function cleanupManagedResources({
  managedResources,
  hooks,
}: CleanupManagedResourcesInput): Promise<ManagedResourcesCleanupErrors> {
  const errors: Partial<ManagedResourcesCleanupErrors> = {};

  for (const resourceGroup of ManagedResourceGroups) {
    errors[resourceGroup] = await cleanupResources({
      resourceGroup,
      resourceIds: managedResources[resourceGroup],
      cleaner: RESOURCE_CLEANERS[resourceGroup],
      batchCleaner: BATCH_CLEANERS[resourceGroup],
      hooks,
    });
  }

  return errors as ManagedResourcesCleanupErrors;
}

export async function cleanupResources({
  resourceGroup,
  resourceIds,
  cleaner,
  batchCleaner,
  hooks,
}: {
  resourceGroup: ManagedResourceGroup;
  resourceIds: string[];
  cleaner: ResourceCleaner;
  batchCleaner?: BatchResourceCleaner;
  hooks?: CleanupManagedResourcesHooks;
}): Promise<ResourceCleanupError[] | BatchCleanupError> {
  try {
    const batchCleanupError = await batchCleaner?.(resourceIds);
    if (batchCleanupError) {
      return batchCleanupError;
    }

    const errors: ResourceCleanupError[] = [];

    for (const resourceId of resourceIds) {
      hooks?.onCleaningUpResource?.(resourceGroup, resourceId);
      const error = await cleaner(resourceId);
      if (error) {
        hooks?.onResourceCleanupFailed?.(resourceGroup, resourceId);
        errors.push({
          resourceId,
          ...error,
        });
      } else {
        hooks?.onResourceCleanedUp?.(resourceGroup, resourceId);
      }
    }

    return errors;
  } catch (error) {
    return {
      reason: "UNKNOWN",
      message: getErrorMessage(error),
    };
  }
}
