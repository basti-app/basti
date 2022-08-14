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
import { ManagedResourceGroup, ManagedResources } from "./managed-resources.js";
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

export async function cleanupManagedResources({
  managedResources,
  hooks,
}: CleanupManagedResourcesInput): Promise<ManagedResourcesCleanupErrors> {
  const accessSecurityGroups = await cleanupResources({
    resourceGroup: "accessSecurityGroups",
    resourceIds: managedResources.accessSecurityGroups,
    cleaner: securityGroupCleaner,
    batchCleaner: accessSecurityGroupReferencesCleaner,
    hooks,
  });
  const bastionInstances = await cleanupResources({
    resourceGroup: "bastionInstances",
    resourceIds: managedResources.bastionInstances,
    cleaner: bastionInstanceCleaner,
    hooks,
  });
  const bastionSecurityGroups = await cleanupResources({
    resourceGroup: "bastionSecurityGroups",
    resourceIds: managedResources.bastionSecurityGroups,
    cleaner: securityGroupCleaner,
    hooks,
  });
  const bastionInstanceProfiles = await cleanupResources({
    resourceGroup: "bastionInstanceProfiles",
    resourceIds: managedResources.bastionInstanceProfiles,
    cleaner: bastionInstanceProfileCleaner,
    hooks,
  });
  const bastionRoles = await cleanupResources({
    resourceGroup: "bastionRoles",
    resourceIds: managedResources.bastionRoles,
    cleaner: bastionRoleCleaner,
    hooks,
  });

  return {
    accessSecurityGroups,
    bastionInstances,
    bastionSecurityGroups,
    bastionInstanceProfiles,
    bastionRoles,
  };
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
