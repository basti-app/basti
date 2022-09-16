import { getEc2Instances } from '../aws/ec2/get-ec2-instances.js';
import { getSecurityGroups } from '../aws/ec2/get-security-groups.js';
import { getIamRoles } from '../aws/iam/get-iam-role.js';
import { getInstanceProfiles } from '../aws/iam/get-instance-profiles.js';
import {
  BASTION_INSTANCE_ID_TAG_NAME,
  BASTION_INSTANCE_PROFILE_PATH,
  BASTION_INSTANCE_ROLE_PATH,
  BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX,
} from '../bastion/bastion.js';
import {
  ManagedResourceType,
  ManagedResourceTypes,
} from '../common/resource-type.js';
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from '../target/target-input.js';
import { CLEANUP_ORDER, ManagedResources } from './managed-resources.js';

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
    states: ['pending', 'running', 'stopping', 'stopped'],
  });
  return bastionInstances.map(instance => instance.id);
}

async function getBastionRoles(): Promise<string[]> {
  const iamRoles = await getIamRoles({ path: BASTION_INSTANCE_ROLE_PATH });
  return iamRoles.map(role => role.name);
}

async function getBastionInstanceProfiles(): Promise<string[]> {
  const instanceProfiles = await getInstanceProfiles({
    path: BASTION_INSTANCE_PROFILE_PATH,
  });
  return instanceProfiles.map(profile => profile.name);
}
