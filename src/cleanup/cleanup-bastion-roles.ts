import { deleteIamRole } from "../aws/iam/delete-iam-role.js";

export interface CleanupBastionRolesHooks {
  onCleaningUpBastionRole?: (roleName: string) => void;
  onBastionRoleCleanedUp?: (roleName: string) => void;
  onBastionRoleCleanupFailed?: (roleName: string) => void;
}
export interface CleanupBastionRolesInput {
  roleNames: string[];
  hooks?: CleanupBastionRolesHooks;
}

export async function cleanupBastionRoles({
  roleNames,
  hooks,
}: CleanupBastionRolesInput): Promise<void> {
  for (const roleName of roleNames) {
    await cleanupBastionRole(roleName, hooks);
  }
}

async function cleanupBastionRole(
  roleName: string,
  hooks?: CleanupBastionRolesHooks
): Promise<void> {
  try {
    hooks?.onCleaningUpBastionRole?.(roleName);

    await deleteIamRole({ roleName });

    hooks?.onBastionRoleCleanedUp?.(roleName);
  } catch (error) {
    hooks?.onBastionRoleCleanupFailed?.(roleName);
  }
}
