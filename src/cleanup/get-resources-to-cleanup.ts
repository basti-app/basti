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
import { TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX } from "../target/target-input.js";
import {
  ManagedResourceGroup,
  ManagedResourceGroups,
  ManagedResources,
} from "./managed-resources.js";

interface GetResourcesToCleanupHooks {
  onRetrievingResources?: (resourceGroup: ManagedResourceGroup) => void;
}

export interface GetResourcesToCleanupInput {
  hooks?: GetResourcesToCleanupHooks;
}

const RESOURCE_RETRIEVERS: Record<
  ManagedResourceGroup,
  () => Promise<string[]>
> = {
  [ManagedResourceGroup.ACCESS_SECURITY_GROUP]: getAccessSecurityGroups,
  [ManagedResourceGroup.BASTION_SECURITY_GROUP]: getBastionSecurityGroups,
  [ManagedResourceGroup.BASTION_INSTANCE]: getBastionInstances,
  [ManagedResourceGroup.BASTION_INSTANCE_PROFILE]: getBastionInstanceProfiles,
  [ManagedResourceGroup.BASTION_ROLE]: getBastionRoles,
};

export async function getResourcesToCleanup({
  hooks,
}: GetResourcesToCleanupInput): Promise<ManagedResources> {
  const managedResources: Partial<ManagedResources> = {};

  for (const resourceGroup of ManagedResourceGroups) {
    hooks?.onRetrievingResources?.(resourceGroup);
    managedResources[resourceGroup] = await RESOURCE_RETRIEVERS[
      resourceGroup
    ]();
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
