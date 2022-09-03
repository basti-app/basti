import { bastionInstanceCleaner } from "./bastion-instance-cleaner.js";
import { bastionInstanceProfileCleaner } from "./bastion-instance-profile-cleaner.js";
import { bastionRoleCleaner } from "./bastion-role-cleaner.js";
import {
  ResourcesCleanupPreparer,
  ResourceCleaner,
} from "./resource-cleaner.js";
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
  onPreparingToCleanup?: (resourceGroup: ManagedResourceGroup) => void;
  onPreparedToCleanup?: (resourceGroup: ManagedResourceGroup) => void;
  onPreparationFailed?: (
    resourceGroup: ManagedResourceGroup,
    error: unknown
  ) => void;
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
    resourceId: string,
    error: unknown
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

const CLEANUP_PREPARERS: Record<
  ManagedResourceGroup,
  ResourcesCleanupPreparer | undefined
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
}: CleanupManagedResourcesInput): Promise<void> {
  for (const resourceGroup of ManagedResourceGroups) {
    await cleanupResources({
      resourceGroup,
      resourceIds: managedResources[resourceGroup],
      cleaner: RESOURCE_CLEANERS[resourceGroup],
      cleanupPreparer: CLEANUP_PREPARERS[resourceGroup],
      hooks,
    });
  }
}

export async function cleanupResources({
  resourceGroup,
  resourceIds,
  cleaner,
  cleanupPreparer,
  hooks,
}: {
  resourceGroup: ManagedResourceGroup;
  resourceIds: string[];
  cleaner: ResourceCleaner;
  cleanupPreparer?: ResourcesCleanupPreparer;
  hooks?: CleanupManagedResourcesHooks;
}): Promise<void> {
  if (cleanupPreparer) {
    try {
      hooks?.onPreparingToCleanup?.(resourceGroup);
      await cleanupPreparer(resourceIds);
      hooks?.onPreparedToCleanup?.(resourceGroup);
    } catch (error) {
      hooks?.onPreparationFailed?.(resourceGroup, error);
      return;
    }
  }

  for (const resourceId of resourceIds) {
    hooks?.onCleaningUpResource?.(resourceGroup, resourceId);
    try {
      await cleaner(resourceId);
      hooks?.onResourceCleanedUp?.(resourceGroup, resourceId);
    } catch (error) {
      hooks?.onResourceCleanupFailed?.(resourceGroup, resourceId, error);
    }
  }
}
