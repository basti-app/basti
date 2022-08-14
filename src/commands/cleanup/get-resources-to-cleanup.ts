import * as cleanupOps from "../../cleanup/get-resources-to-cleanup.js";
import {
  ManagedResourceGroup,
  ManagedResources,
} from "../../cleanup/managed-resources.js";
import { cli } from "../../common/cli.js";

const RESOURCE_GROUP_NAMES: Record<ManagedResourceGroup, string> = {
  accessSecurityGroups: "access security groups",
  bastionSecurityGroups: "bastion security groups",
  bastionInstances: "bastion EC2 instances",
  bastionInstanceProfiles: "bastion IAM instance profiles",
  bastionRoles: "bastion IAM roles",
};

export async function getResourcesToCleanup(): Promise<ManagedResources> {
  const managedResources = await cleanupOps.getResourcesToCleanup({
    hooks: {
      onRetrievingResources: (group) =>
        cli.progressStart(`Retrieving ${RESOURCE_GROUP_NAMES[group]}`),
    },
  });

  cli.progressSuccess("Managed resources retrieved");

  return managedResources;
}
