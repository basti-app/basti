import { getDbClusters } from "../aws/rds/get-db-clusters.js";
import { getDbInstances } from "../aws/rds/get-db-instances.js";
import { modifyDBCluster } from "../aws/rds/modify-db-cluster.js";
import { modifyDbInstance } from "../aws/rds/modify-db-instance.js";
import {
  cleanupSecurityGroup,
  CleanupSecurityGroupHooks,
} from "./cleanup-security-group.js";

export interface CleanupAccessSecurityGroupsHooks
  extends CleanupSecurityGroupHooks {
  onCleaningUpDbInstanceReferences?: () => void;
  onDbInstanceReferencesCleanedUp?: () => void;
  onCleaningUpDbClusterReferences?: () => void;
  onDbClusterReferencesCleanedUp?: () => void;
}

export interface CleanupAccessSecurityGroupsInput {
  securityGroupIds: string[];
  hooks?: CleanupAccessSecurityGroupsHooks;
}

export async function cleanupAccessSecurityGroups({
  securityGroupIds,
  hooks,
}: CleanupAccessSecurityGroupsInput): Promise<void> {
  await cleanupReferences(securityGroupIds, hooks);
  return cleanupSecurityGroups(securityGroupIds, hooks);
}

async function cleanupReferences(
  securityGroupIds: string[],
  hooks?: CleanupAccessSecurityGroupsHooks
): Promise<void> {
  const securityGroupIdSet = new Set(securityGroupIds);
  await cleanupDbInstanceReferences(securityGroupIdSet, hooks);
  await cleanupDbClusterReferences(securityGroupIdSet, hooks);
}

async function cleanupSecurityGroups(
  securityGroupIds: string[],
  hooks?: CleanupAccessSecurityGroupsHooks
): Promise<void> {
  for (const securityGroupId of securityGroupIds) {
    await cleanupSecurityGroup({ securityGroupId, hooks });
  }
}

async function cleanupDbInstanceReferences(
  securityGroupIds: Set<string>,
  hooks?: CleanupAccessSecurityGroupsHooks
): Promise<void> {
  const dbInstancesWithReferences = (await getDbInstances()).filter(
    (instance) => arrayContains(instance.securityGroupIds, securityGroupIds)
  );

  if (!dbInstancesWithReferences.length) {
    return;
  }

  hooks?.onCleaningUpDbInstanceReferences?.();

  for (const dbInstance of dbInstancesWithReferences) {
    await modifyDbInstance({
      identifier: dbInstance.identifier,
      securityGroupIds: filterOut(
        dbInstance.securityGroupIds,
        securityGroupIds
      ),
    });
  }

  hooks?.onDbInstanceReferencesCleanedUp?.();
}

async function cleanupDbClusterReferences(
  securityGroupsIds: Set<string>,
  hooks?: CleanupAccessSecurityGroupsHooks
): Promise<void> {
  const dbClustersWithReferences = (await getDbClusters()).filter((cluster) =>
    arrayContains(cluster.securityGroupIds, securityGroupsIds)
  );

  if (!dbClustersWithReferences.length) {
    return;
  }

  hooks?.onCleaningUpDbClusterReferences?.();

  for (const dbCluster of dbClustersWithReferences) {
    await modifyDBCluster({
      identifier: dbCluster.identifier,
      securityGroupIds: filterOut(
        dbCluster.securityGroupIds,
        securityGroupsIds
      ),
    });
  }

  hooks?.onDbClusterReferencesCleanedUp?.();
}

function arrayContains(arr: string[], set: Set<string>): boolean {
  return arr.some((el) => set.has(el));
}

function filterOut(arr: string[], set: Set<string>): string[] {
  return arr.filter((el) => !set.has(el));
}
