import { getEc2Instances } from "../aws/ec2/get-ec2-instances.js";
import { getSecurityGroups } from "../aws/ec2/get-security-groups.js";
import { getIamRoles } from "../aws/iam/get-iam-role.js";
import { getInstanceProfiles } from "../aws/iam/get-instance-profiles.js";
import {
  BASTION_INSTANCE_ID_TAG_NAME,
  BASTION_INSTANCE_PROFILE_PATH,
  BASTION_INSTANCE_ROLE_PATH,
  BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX,
} from "../bastion/bastion.js";
import { ManagedResourceType } from "../common/resource-type.js";
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from "../target/target-input.js";
import { CLEANUP_ORDER, ManagedResources } from "./managed-resources.js";

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
  [ManagedResourceType.ACCESS_SECURITY_GROUP]: getAccessSecurityGroups,
  [ManagedResourceType.BASTION_SECURITY_GROUP]: getBastionSecurityGroups,
  [ManagedResourceType.BASTION_INSTANCE]: getBastionInstances,
  [ManagedResourceType.BASTION_INSTANCE_PROFILE]: getBastionInstanceProfiles,
  [ManagedResourceType.BASTION_ROLE]: getBastionRoles,
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
  return (
    await getSecurityGroups({
      names: [`${TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX}*`],
    })
  ).map((securityGroup) => securityGroup.id);
}

async function getBastionSecurityGroups(): Promise<string[]> {
  return (
    await getSecurityGroups({
      names: [`${BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX}*`],
    })
  ).map((securityGroup) => securityGroup.id);
}

async function getBastionInstances(): Promise<string[]> {
  return (
    await getEc2Instances({
      tags: [
        {
          key: BASTION_INSTANCE_ID_TAG_NAME,
          value: "*",
        },
      ],
      states: ["pending", "running", "stopping", "stopped"],
    })
  ).map((instance) => instance.id);
}

async function getBastionRoles(): Promise<string[]> {
  return (await getIamRoles({ path: BASTION_INSTANCE_ROLE_PATH })).map(
    (role) => role.name
  );
}

async function getBastionInstanceProfiles(): Promise<string[]> {
  return (
    await getInstanceProfiles({ path: BASTION_INSTANCE_PROFILE_PATH })
  ).map((profile) => profile.name);
}
