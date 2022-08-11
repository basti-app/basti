import ora from "ora";
import { cleanupAccessSecurityGroups } from "../../cleanup/cleanup-access-security-groups.js";
import { cleanupBastionInstanceProfiles } from "../../cleanup/cleanup-bastion-instance-profiles.js";
import { cleanupBastionInstances } from "../../cleanup/cleanup-bastion-instances.js";
import { cleanupBastionRoles } from "../../cleanup/cleanup-bastion-roles.js";
import { cleanupBastionSecurityGroups } from "../../cleanup/cleanup-bastion-security-groups.js";
import { SecurityGroupCleanupErrorReason } from "../../cleanup/cleanup-security-group.js";
import { ManagedResources } from "../../cleanup/get-managed-resources.js";

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

export async function cleanupResources({
  resources,
}: CleanupResourcesInput): Promise<CleanupErrors> {
  const {
    accessSecurityGroups,
    bastionInstances,
    bastionSecurityGroups,
    bastionInstanceProfiles,
    bastionRoles,
  } = resources;

  const accessSecurityGroupErrors = await cleanupAccessSecurityGroupsWithLogs(
    accessSecurityGroups
  );
  const bastionInstanceErrors = await cleanupBastionInstancesWithLogs(
    bastionInstances
  );
  const bastionSecurityGroupErrors = await cleanupBastionSecurityGroupsWithLogs(
    bastionSecurityGroups
  );
  const bastionInstanceProfileErrors =
    await cleanupBastionInstanceProfilesWithLogs(bastionInstanceProfiles);
  const bastionRoleErrors = await cleanupBastionRolesWithLogs(bastionRoles);

  return {
    accessSecurityGroups: accessSecurityGroupErrors,
    bastionInstances: bastionInstanceErrors,
    bastionSecurityGroups: bastionSecurityGroupErrors,
    bastionInstanceProfiles: bastionInstanceProfileErrors,
    bastionRoles: bastionRoleErrors,
  };
}

async function cleanupAccessSecurityGroupsWithLogs(
  securityGroupIds: string[]
): Promise<CleanupError[]> {
  const spinner = ora();

  const errors: CleanupError[] = [];

  console.log("Cleaning up access security groups:");
  await cleanupAccessSecurityGroups({
    securityGroupIds,
    hooks: {
      onCleaningUpDbInstanceReferences: () =>
        spinner.start("Removing references in DB instances"),
      onCleaningUpDbClusterReferences: () =>
        spinner.start("Removing references in DB clusters"),
      onCleaningUpSecurityGroup: (securityGroupId) =>
        spinner.start(securityGroupId),
      onSecurityGroupCleanedUp: (securityGroupId) =>
        spinner.succeed(securityGroupId),
      onSecurityGroupCleanupFailed: (securityGroupId, reason) => {
        errors.push({
          resourceId: securityGroupId,
          error: getSecurityGroupCleanupError(reason),
        });
        spinner.fail(securityGroupId);
      },
    },
  });

  return errors;
}

async function cleanupBastionInstancesWithLogs(
  instanceIds: string[]
): Promise<CleanupError[]> {
  const spinner = ora();

  const errors: CleanupError[] = [];

  console.log("Cleaning up bastion instances:");
  await cleanupBastionInstances({
    instanceIds,
    hooks: {
      onCleaningUpBastionInstance: (instanceId) => spinner.start(instanceId),
      onBastionInstanceCleanedUp: (instanceId) => spinner.succeed(instanceId),
      onBastionInstanceCleanupFailed: (instanceId) => {
        errors.push({
          resourceId: instanceId,
          error: "Bastion instance cleanup failed unexpectedly",
        });
        spinner.fail(instanceId);
      },
    },
  });

  return errors;
}

async function cleanupBastionSecurityGroupsWithLogs(
  securityGroupIds: string[]
): Promise<CleanupError[]> {
  const spinner = ora();

  const errors: CleanupError[] = [];

  console.log("Cleaning up bastion security groups:");
  await cleanupBastionSecurityGroups({
    securityGroupIds,
    hooks: {
      onCleaningUpSecurityGroup: (securityGroupId) =>
        spinner.start(securityGroupId),
      onSecurityGroupCleanedUp: (securityGroupId) =>
        spinner.succeed(securityGroupId),
      onSecurityGroupCleanupFailed: (securityGroupId, reason) => {
        errors.push({
          resourceId: securityGroupId,
          error: getSecurityGroupCleanupError(reason),
        });
        spinner.fail(securityGroupId);
      },
    },
  });

  return errors;
}

async function cleanupBastionRolesWithLogs(
  roleNames: string[]
): Promise<CleanupError[]> {
  const spinner = ora();

  const errors: CleanupError[] = [];

  console.log("Cleaning up bastion IAM roles:");
  await cleanupBastionRoles({
    roleNames,
    hooks: {
      onCleaningUpBastionRole: (roleName) => spinner.start(roleName),
      onBastionRoleCleanedUp: (roleName) => spinner.succeed(roleName),
      onBastionRoleCleanupFailed: (roleName) => {
        errors.push({
          resourceId: roleName,
          error: "Bastion IAM role cleanup failed unexpectedly",
        });
        spinner.fail(roleName);
      },
    },
  });

  return errors;
}

async function cleanupBastionInstanceProfilesWithLogs(
  instanceProfileNames: string[]
): Promise<CleanupError[]> {
  const spinner = ora();

  const errors: CleanupError[] = [];

  console.log("Cleaning up bastion IAM instance profiles:");
  await cleanupBastionInstanceProfiles({
    instanceProfileNames,
    hooks: {
      onCleaningUpInstanceProfile: (profileName) => spinner.start(profileName),
      onInstanceProfileCleanedUp: (profileName) => spinner.succeed(profileName),
      onInstanceProfileCleanupFailed: (profileName) => {
        errors.push({
          resourceId: profileName,
          error: "Bastion IAM instance profile cleanup failed unexpectedly",
        });
        spinner.fail(profileName);
      },
    },
  });

  return errors;
}

function getSecurityGroupCleanupError(
  reason: SecurityGroupCleanupErrorReason
): string {
  switch (reason) {
    case "DEPENDENCY_VIOLATION":
      return (
        "Security group couldn't be deleted as it is referenced by a resource that is not managed by Basti. " +
        "Please remove all references manually and repeat cleanup"
      );
    default:
      return "Security group cleanup failed unexpectedly";
  }
}
