import {
  cleanupSecurityGroup,
  CleanupSecurityGroupHooks,
} from "./cleanup-security-group.js";

interface CleanupBastionSecurityGroupsHooks extends CleanupSecurityGroupHooks {}

export interface CleanupBastionSecurityGroupsInput {
  securityGroupIds: string[];
  hooks?: CleanupBastionSecurityGroupsHooks;
}

export async function cleanupBastionSecurityGroups({
  securityGroupIds,
  hooks,
}: CleanupBastionSecurityGroupsInput): Promise<void> {
  for (const securityGroupId of securityGroupIds) {
    await cleanupSecurityGroup({ securityGroupId, hooks });
  }
}
