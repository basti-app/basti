import ora, { Ora } from "ora";
import { ManagedResourcesCleanupErrors } from "../../cleanup/cleanup-errors.js";
import { cleanupManagedResources } from "../../cleanup/cleanup-managed-resources.js";
import {
  ManagedResourceGroup,
  ManagedResources,
} from "../../cleanup/managed-resources.js";

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
  accessSecurityGroups: "access security group",
  bastionInstances: "bastion EC2 instance",
  bastionSecurityGroups: "bastion security group",
  bastionInstanceProfiles: "bastion IAM instance profile",
  bastionRoles: "bastion IAM role",
};

export async function cleanupResources({
  resources,
}: CleanupResourcesInput): Promise<ManagedResourcesCleanupErrors> {
  const spinner = ora();

  return cleanupManagedResources({
    managedResources: resources,
    hooks: {
      onCleaningUpResource: (group, id) =>
        spinner.start(`Deleting ${RESOURCE_NAMES[group]}: ${id}`),
      onResourceCleanedUp: (group, id) =>
        spinner.succeed(`${capitalize(RESOURCE_NAMES[group])} deleted: ${id}`),
      onResourceCleanupFailed: (group, id) =>
        spinner.fail(`Failed to delete ${RESOURCE_NAMES[group]}: ${id}`),
    },
  });
}

function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
