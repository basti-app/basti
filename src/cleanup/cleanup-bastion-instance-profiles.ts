import { deleteInstanceProfile } from "../aws/iam/delete-instance-profile.js";

export type AccessSecurityGroupCleanupErrorReason =
  | "DEPENDENCY_VIOLATION"
  | "UNKNOWN";

export interface CleanupBastionInstanceProfilesHooks {
  onCleaningUpInstanceProfile?: (profileName: string) => void;
  onInstanceProfileCleanedUp?: (profileName: string) => void;
  onInstanceProfileCleanupFailed?: (profileName: string) => void;
}

export interface CleanupBastionInstanceProfilesInput {
  instanceProfileNames: string[];
  hooks?: CleanupBastionInstanceProfilesHooks;
}

export async function cleanupBastionInstanceProfiles({
  instanceProfileNames,
  hooks,
}: CleanupBastionInstanceProfilesInput): Promise<void> {
  for (const profileName of instanceProfileNames) {
    await cleanupInstanceProfile(profileName, hooks);
  }
}

async function cleanupInstanceProfile(
  profileName: string,
  hooks?: CleanupBastionInstanceProfilesHooks
): Promise<void> {
  try {
    hooks?.onCleaningUpInstanceProfile?.(profileName);

    await deleteInstanceProfile({ name: profileName });

    hooks?.onInstanceProfileCleanedUp?.(profileName);
  } catch (error) {
    hooks?.onInstanceProfileCleanupFailed?.(profileName);
  }
}
