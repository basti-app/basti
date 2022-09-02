import * as cleanupOps from "../../../cleanup/get-resources-to-cleanup.js";
import {
  ManagedResourceGroup,
  ManagedResources,
} from "../../../cleanup/managed-resources.js";
import { cli } from "../../../common/cli.js";

const RESOURCE_GROUP_NAMES: Record<ManagedResourceGroup, string> = {
  [ManagedResourceGroup.ACCESS_SECURITY_GROUP]: "access security groups",
  [ManagedResourceGroup.BASTION_SECURITY_GROUP]: "bastion security groups",
  [ManagedResourceGroup.BASTION_INSTANCE]: "bastion EC2 instances",
  [ManagedResourceGroup.BASTION_INSTANCE_PROFILE]:
    "bastion IAM instance profiles",
  [ManagedResourceGroup.BASTION_ROLE]: "bastion IAM roles",
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
