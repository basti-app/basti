import { AwsDependencyViolationError } from '../aws/common/aws-error.js';
import { deleteSecurityGroup } from '../aws/ec2/delete-security-group.js';
import { getDbClusters } from '../aws/rds/get-db-clusters.js';
import { getDbInstances } from '../aws/rds/get-db-instances.js';
import { modifyDBCluster } from '../aws/rds/modify-db-cluster.js';
import { modifyDbInstance } from '../aws/rds/modify-db-instance.js';
import { retry } from '../common/retry.js';
import {
  ResourcesCleanupPreparer,
  ResourceCleaner,
} from './resource-cleaner.js';

export const accessSecurityGroupReferencesCleaner: ResourcesCleanupPreparer =
  async groupIds => {
    const groupIdSet = new Set(groupIds);
    await cleanupDbInstanceReferences(groupIdSet);
    await cleanupDbClusterReferences(groupIdSet);
  };

export const securityGroupCleaner: ResourceCleaner = async groupId => {
  await retry(() => deleteSecurityGroup({ groupId }), {
    delay: 3000,
    maxRetries: 15,
    shouldRetry: error => error instanceof AwsDependencyViolationError,
  });
};

async function cleanupDbInstanceReferences(
  securityGroupIds: Set<string>
): Promise<void> {
  const dbInstances = await getDbInstances();

  const dbInstancesWithReferences = dbInstances.filter(instance =>
    arrayContains(instance.securityGroupIds, securityGroupIds)
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
  const dbClusters = await getDbClusters();

  const dbClustersWithReferences = dbClusters.filter(cluster =>
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

function arrayContains(arr: string[], set: Set<string>): boolean {
  return arr.some(el => set.has(el));
}

function filterOut(arr: string[], set: Set<string>): string[] {
  return arr.filter(el => !set.has(el));
}
