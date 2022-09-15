import { bastionInstanceCleaner } from './bastion-instance-cleaner.js';
import { bastionInstanceProfileCleaner } from './bastion-instance-profile-cleaner.js';
import { bastionRoleCleaner } from './bastion-role-cleaner.js';
import {
  ResourcesCleanupPreparer,
  ResourceCleaner,
} from './resource-cleaner.js';
import { CLEANUP_ORDER, ManagedResources } from './managed-resources.js';
import {
  accessSecurityGroupReferencesCleaner,
  securityGroupCleaner,
} from './security-group-cleaner.js';
import {
  ManagedResourceType,
  ManagedResourceTypes,
} from '../common/resource-type.js';

interface CleanupManagedResourcesHooks {
  onPreparingToCleanup?: (resourceGroup: ManagedResourceType) => void;
  onPreparedToCleanup?: (resourceGroup: ManagedResourceType) => void;
  onPreparationFailed?: (
    resourceGroup: ManagedResourceType,
    error: unknown
  ) => void;
  onCleaningUpResource?: (
    resourceGroup: ManagedResourceType,
    resourceId: string
  ) => void;
  onResourceCleanedUp?: (
    resourceGroup: ManagedResourceType,
    resourceId: string
  ) => void;
  onResourceCleanupFailed?: (
    resourceGroup: ManagedResourceType,
    resourceId: string,
    error: unknown
  ) => void;
}

export interface CleanupManagedResourcesInput {
  managedResources: ManagedResources;
  hooks?: CleanupManagedResourcesHooks;
}

const RESOURCE_CLEANERS: Record<
  ManagedResourceType,
  { cleaner: ResourceCleaner; preparer?: ResourcesCleanupPreparer }
> = {
  [ManagedResourceTypes.ACCESS_SECURITY_GROUP]: {
    cleaner: securityGroupCleaner,
    preparer: accessSecurityGroupReferencesCleaner,
  },
  [ManagedResourceTypes.BASTION_SECURITY_GROUP]: {
    cleaner: securityGroupCleaner,
  },
  [ManagedResourceTypes.BASTION_INSTANCE]: {
    cleaner: bastionInstanceCleaner,
  },
  [ManagedResourceTypes.BASTION_INSTANCE_PROFILE]: {
    cleaner: bastionInstanceProfileCleaner,
  },
  [ManagedResourceTypes.BASTION_ROLE]: {
    cleaner: bastionRoleCleaner,
  },
};

export async function cleanupManagedResources({
  managedResources,
  hooks,
}: CleanupManagedResourcesInput): Promise<void> {
  for (const resourceGroup of CLEANUP_ORDER) {
    await cleanupResources({
      resourceGroup,
      resourceIds: managedResources[resourceGroup],
      cleaner: RESOURCE_CLEANERS[resourceGroup].cleaner,
      cleanupPreparer: RESOURCE_CLEANERS[resourceGroup].preparer,
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
  resourceGroup: ManagedResourceType;
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
