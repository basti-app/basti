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
import { ManagedResources } from "./managed-resources.js";

export interface GetManagedResourcesInput {
  hooks?: {
    onRetrievingAccessSecurityGroups?: () => void;
    onRetrievingBastionSecurityGroups?: () => void;
    onRetrievingBastionInstances?: () => void;
    onRetrievingBastionRoles?: () => void;
    onRetrievingBastionInstanceProfiles?: () => void;
  };
}

export async function getManagedResources({
  hooks,
}: GetManagedResourcesInput): Promise<ManagedResources> {
  hooks?.onRetrievingAccessSecurityGroups?.();
  const accessSecurityGroups = await getAccessSecurityGroups();

  hooks?.onRetrievingBastionSecurityGroups?.();
  const bastionSecurityGroups = await getBastionSecurityGroups();

  hooks?.onRetrievingBastionInstances?.();
  const bastionInstances = await getBastionInstances();

  hooks?.onRetrievingBastionRoles?.();
  const bastionRoles = await getBastionRoles();

  hooks?.onRetrievingBastionInstanceProfiles?.();
  const bastionInstanceProfiles = await getBastionInstanceProfiles();

  return {
    accessSecurityGroups,
    bastionSecurityGroups,
    bastionInstances,
    bastionRoles,
    bastionInstanceProfiles,
  };
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
    })
  ).map((instance) => instance.id);
}

async function getBastionRoles(): Promise<string[]> {
  return (await getIamRoles({ path: BASTION_INSTANCE_ROLE_PATH })).map(
    (role) => role.name
  );
}

async function getBastionInstanceProfiles(): Promise<string[]> {
  return await (
    await getInstanceProfiles({ path: BASTION_INSTANCE_PROFILE_PATH })
  ).map((profile) => profile.name);
}
