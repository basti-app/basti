import { ManagedResourcesCleanupErrors } from "../../../cleanup/cleanup-errors.js";
import { cleanupManagedResources } from "../../../cleanup/cleanup-managed-resources.js";
import {
  ManagedResourceGroup,
  ManagedResources,
} from "../../../cleanup/managed-resources.js";
import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";

export interface CleanupResourcesInput {
  resources: ManagedResources;
}

export interface CleanupError {
  resourceId: string;
  error: string;
}

export type CleanupErrors = {
  [key in keyof ManagedResources]: CleanupError[];
};

const RESOURCE_NAMES: Record<ManagedResourceGroup, string> = {
  [ManagedResourceGroup.ACCESS_SECURITY_GROUP]: "access security group",
  [ManagedResourceGroup.BASTION_INSTANCE]: "bastion EC2 instance",
  [ManagedResourceGroup.BASTION_SECURITY_GROUP]: "bastion security group",
  [ManagedResourceGroup.BASTION_INSTANCE_PROFILE]:
    "bastion IAM instance profile",
  [ManagedResourceGroup.BASTION_ROLE]: "bastion IAM role",
};

export async function cleanupResources({
  resources,
}: CleanupResourcesInput): Promise<ManagedResourcesCleanupErrors> {
  return cleanupManagedResources({
    managedResources: resources,
    hooks: {
      onCleaningUpResource: (group, id) =>
        cli.progressStart(
          `Deleting ${RESOURCE_NAMES[group]}: ${fmt.value(id)}`
        ),
      onResourceCleanedUp: (group, id) =>
        cli.progressSuccess(
          `${capitalize(RESOURCE_NAMES[group])} deleted: ${fmt.value(id)}`
        ),
      onResourceCleanupFailed: (group, id) =>
        cli.progressFailure(
          `Failed to delete ${RESOURCE_NAMES[group]}: ${fmt.value(id)}`
        ),
    },
  });
}

function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
