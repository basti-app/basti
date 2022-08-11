import { EC2ServiceException } from "@aws-sdk/client-ec2";
import { deleteSecurityGroup } from "../aws/ec2/delete-security-group.js";
import { retry } from "../common/retry.js";

export type SecurityGroupCleanupErrorReason =
  | "DEPENDENCY_VIOLATION"
  | "UNKNOWN";

export interface CleanupSecurityGroupHooks {
  onCleaningUpSecurityGroup?: (securityGroupId: string) => void;
  onSecurityGroupCleanedUp?: (securityGroupId: string) => void;
  onSecurityGroupCleanupFailed?: (
    securityGroupId: string,
    reason: SecurityGroupCleanupErrorReason
  ) => void;
}

export interface CleanupSecurityGroupInput {
  securityGroupId: string;
  hooks?: CleanupSecurityGroupHooks;
}

export async function cleanupSecurityGroup({
  securityGroupId,
  hooks,
}: CleanupSecurityGroupInput): Promise<void> {
  try {
    hooks?.onCleaningUpSecurityGroup?.(securityGroupId);
    await retry(() => deleteSecurityGroup({ groupId: securityGroupId }), {
      delay: 3000,
      maxRetries: 15,
      shouldRetry: isDependencyViolationError,
    });
    hooks?.onSecurityGroupCleanedUp?.(securityGroupId);
  } catch (error) {
    if (isDependencyViolationError(error)) {
      hooks?.onSecurityGroupCleanupFailed?.(
        securityGroupId,
        "DEPENDENCY_VIOLATION"
      );
    } else {
      hooks?.onSecurityGroupCleanupFailed?.(securityGroupId, "UNKNOWN");
    }
  }
}

function isDependencyViolationError(error: unknown): boolean {
  return (
    error instanceof EC2ServiceException && error.name === "DependencyViolation"
  );
}
