import { EC2ServiceException } from "@aws-sdk/client-ec2";
import { deleteSecurityGroup } from "../aws/ec2/delete-security-group.js";
import { getDbClusters } from "../aws/rds/get-db-clusters.js";
import { getDbInstances } from "../aws/rds/get-db-instances.js";
import { modifyDBCluster } from "../aws/rds/modify-db-cluster.js";
import { modifyDbInstance } from "../aws/rds/modify-db-instance.js";
import { retry } from "../common/retry.js";
import { BatchResourceCleaner, ResourceCleaner } from "./cleanup-errors.js";

export const accessSecurityGroupReferencesCleaner: BatchResourceCleaner =
  async (groupIds) => {
    try {
      const groupIdSet = new Set(groupIds);
      await cleanupDbInstanceReferences(groupIdSet);
      await cleanupDbClusterReferences(groupIdSet);
    } catch (error) {
      return {
        reason: "UNKNOWN",
        message: error instanceof Error ? error.message : undefined,
      };
    }
  };

export const securityGroupCleaner: ResourceCleaner = async (groupId) => {
  try {
    await retry(() => deleteSecurityGroup({ groupId }), {
      delay: 3000,
      maxRetries: 15,
      shouldRetry: isDependencyViolationError,
    });
  } catch (error) {
    if (isDependencyViolationError(error)) {
      return {
        reason: "DEPENDENCY_VIOLATION",
      };
    } else {
      return {
        reason: "UNKNOWN",
        message: error instanceof Error ? error.message : undefined,
      };
    }
  }
};

async function cleanupDbInstanceReferences(
  securityGroupIds: Set<string>
): Promise<void> {
  const dbInstancesWithReferences = (await getDbInstances()).filter(
    (instance) => arrayContains(instance.securityGroupIds, securityGroupIds)
  );

  if (!dbInstancesWithReferences.length) {
    return;
  }

  for (const dbInstance of dbInstancesWithReferences) {
    await modifyDbInstance({
      identifier: dbInstance.identifier,
      securityGroupIds: filterOut(
        dbInstance.securityGroupIds,
        securityGroupIds
      ),
    });
  }
}

async function cleanupDbClusterReferences(
  securityGroupsIds: Set<string>
): Promise<void> {
  const dbClustersWithReferences = (await getDbClusters()).filter((cluster) =>
    arrayContains(cluster.securityGroupIds, securityGroupsIds)
  );

  if (!dbClustersWithReferences.length) {
    return;
  }

  for (const dbCluster of dbClustersWithReferences) {
    await modifyDBCluster({
      identifier: dbCluster.identifier,
      securityGroupIds: filterOut(
        dbCluster.securityGroupIds,
        securityGroupsIds
      ),
    });
  }
}

function isDependencyViolationError(error: unknown): boolean {
  return (
    error instanceof EC2ServiceException && error.name === "DependencyViolation"
  );
}

function arrayContains(arr: string[], set: Set<string>): boolean {
  return arr.some((el) => set.has(el));
}

function filterOut(arr: string[], set: Set<string>): string[] {
  return arr.filter((el) => !set.has(el));
}
