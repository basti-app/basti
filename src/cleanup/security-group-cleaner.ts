import { AwsDependencyViolationError } from '../aws/common/aws-errors.js';
import { deleteSecurityGroup } from '../aws/ec2/delete-security-group.js';
import { getDbClusters } from '../aws/rds/get-db-clusters.js';
import { getDbInstances } from '../aws/rds/get-db-instances.js';
import { modifyDBCluster } from '../aws/rds/modify-db-cluster.js';
import { modifyDbInstance } from '../aws/rds/modify-db-instance.js';
import { retry } from '../common/retry.js';
import { getRawReplicationGroups } from '../aws/elasticache/get-elasticache-replication-groups.js';
import { getRawCacheClusters } from '../aws/elasticache/get-elasticache-cache-clusters.js';
import { modifyElasticacheReplicationGroup } from '../aws/elasticache/modify-elasticache-replication-group.js';

import type {
  CacheCluster,
  ReplicationGroup,
} from '@aws-sdk/client-elasticache';
import type {
  ResourcesCleanupPreparer,
  ResourceCleaner,
} from './resource-cleaner.js';

export const accessSecurityGroupReferencesCleaner: ResourcesCleanupPreparer =
  async groupIds => {
    const groupIdSet = new Set(groupIds);
    await cleanupDbInstanceReferences(groupIdSet);
    await cleanupDbClusterReferences(groupIdSet);
    await CleanupElasticacheSecurityGroups(groupIdSet);
  };

export const securityGroupCleaner: ResourceCleaner = async groupId => {
  await retry(async () => await deleteSecurityGroup({ groupId }), {
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
  if (dbInstancesWithReferences.length === 0) {
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
  if (dbClustersWithReferences.length === 0) {
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
export async function CleanupElasticacheSecurityGroups(
  groupIds: Set<string>
): Promise<void> {
  const CacheClusters = await getRawCacheClusters();
  const ReplicationGroups = await getRawReplicationGroups();

  for (const ReplicationGroup of ReplicationGroups) {
    await cleanReplicationGroup(ReplicationGroup, CacheClusters, groupIds);
  }
}

async function cleanReplicationGroup(
  replicationGroup: ReplicationGroup,
  CacheClusters: CacheCluster[],
  groupIds: Set<string>
): Promise<void> {
  if (
    replicationGroup.NodeGroups === undefined ||
    replicationGroup.NodeGroups[0] === undefined ||
    replicationGroup.NodeGroups[0].NodeGroupMembers === undefined ||
    replicationGroup.NodeGroups[0].NodeGroupMembers[0] === undefined
  )
    return;
  const exampleCacheCluster =
    replicationGroup.NodeGroups[0].NodeGroupMembers[0].CacheClusterId;
  const cacheSecurityGroups = CacheClusters.find(
    cache => cache.CacheClusterId === exampleCacheCluster
  );
  if (
    cacheSecurityGroups === undefined ||
    cacheSecurityGroups.SecurityGroups === undefined
  )
    return;
  const cacheSecurityGroupsIds: string[] = [
    ...cacheSecurityGroups.SecurityGroups.flatMap(
      group => group.SecurityGroupId ?? ' '
    ).filter(id => id !== ' ' && groupIds.has(id)),
  ];

  if (
    cacheSecurityGroupsIds.length !== cacheSecurityGroups.SecurityGroups.length
  ) {
    await modifyElasticacheReplicationGroup({
      identifier: replicationGroup.ReplicationGroupId,
      securityGroupIds: cacheSecurityGroupsIds,
      cachePreviousSecurityGroups: cacheSecurityGroups.SecurityGroups,
    });
  }
}
