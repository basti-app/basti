import { InstanceStateName } from '@aws-sdk/client-ec2';

import { getEc2Instances } from '../aws/ec2/get-ec2-instances.js';
import { getSecurityGroups } from '../aws/ec2/get-security-groups.js';
import { getIamRolesCurrentRegion } from '../aws/iam/get-iam-role.js';
import { getInstanceProfilesCurrentRegion } from '../aws/iam/get-instance-profiles.js';
import {
  BASTION_INSTANCE_ID_TAG_NAME,
  BASTION_INSTANCE_PROFILE_PATH_PREFIX,
  BASTION_INSTANCE_ROLE_PATH_PREFIX,
  BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX,
} from '../bastion/bastion.js';
import { ManagedResourceTypes } from '../common/resource-type.js';
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from '../target/target-input.js';

import { CLEANUP_ORDER } from './managed-resources.js';

import type { ManagedResources } from './managed-resources.js';
import type { ManagedResourceType } from '../common/resource-type.js';

interface GetResourcesToCleanupHooks {
  onRetrievingResources?: (resourceGroup: ManagedResourceType) => void;
  onResourcesRetrieved?: (resourceGroup: ManagedResourceType) => void;
  onRetrievalFailed?: (
    resourceGroup: ManagedResourceType,
    error: unknown
  ) => void;
}

export interface GetResourcesToCleanupInput {
  hooks?: GetResourcesToCleanupHooks;
}

const RESOURCE_RETRIEVERS: Record<
  ManagedResourceType,
  () => Promise<string[]>
> = {
  [ManagedResourceTypes.ACCESS_SECURITY_GROUP]: getAccessSecurityGroups,
  [ManagedResourceTypes.BASTION_SECURITY_GROUP]: getBastionSecurityGroups,
  [ManagedResourceTypes.BASTION_INSTANCE]: getBastionInstances,
  [ManagedResourceTypes.BASTION_INSTANCE_PROFILE]: getBastionInstanceProfiles,
  [ManagedResourceTypes.BASTION_ROLE]: getBastionRoles,
};

export async function getResourcesToCleanup({
  hooks,
}: GetResourcesToCleanupInput): Promise<ManagedResources> {
  const managedResources: Partial<ManagedResources> = {};

  for (const resourceGroup of CLEANUP_ORDER) {
    try {
      hooks?.onRetrievingResources?.(resourceGroup);
      managedResources[resourceGroup] = await RESOURCE_RETRIEVERS[
        resourceGroup
      ]();
      hooks?.onResourcesRetrieved?.(resourceGroup);
    } catch (error) {
      hooks?.onRetrievalFailed?.(resourceGroup, error);
      managedResources[resourceGroup] = [];
    }
  }

  return managedResources as ManagedResources;
}

async function getAccessSecurityGroups(): Promise<string[]> {
  const securityGroups = await getSecurityGroups({
    names: [`${TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX}*`],
  });
  return securityGroups.map(securityGroup => securityGroup.id);
}

async function getBastionSecurityGroups(): Promise<string[]> {
  const securityGroups = await getSecurityGroups({
    names: [`${BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX}*`],
  });
  return securityGroups.map(securityGroup => securityGroup.id);
}

async function getBastionInstances(): Promise<string[]> {
  const bastionInstances = await getEc2Instances({
    tags: [
      {
        key: BASTION_INSTANCE_ID_TAG_NAME,
        value: '*',
      },
    ],
    states: [
      InstanceStateName.pending,
      InstanceStateName.running,
      InstanceStateName.stopping,
      InstanceStateName.stopped,
    ],
  });
  return bastionInstances.map(instance => instance.id);
}

async function getBastionRoles(): Promise<string[]> {
  const iamRoles = await getIamRolesCurrentRegion({
    pathPrefix: BASTION_INSTANCE_ROLE_PATH_PREFIX,
  });
  return iamRoles.map(role => role.name);
}

async function getBastionInstanceProfiles(): Promise<string[]> {
  const instanceProfiles = await getInstanceProfilesCurrentRegion({
    pathPrefix: BASTION_INSTANCE_PROFILE_PATH_PREFIX,
  });
  return instanceProfiles.map(profile => profile.name);
}
