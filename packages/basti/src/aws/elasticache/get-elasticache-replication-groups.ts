import { DescribeReplicationGroupsCommand } from '@aws-sdk/client-elasticache';

import { AwsNotFoundError } from '../common/aws-errors.js';

import { parseElasticacheResponse } from './parse-elasticache-response.js';
import { elasticacheClient } from './elasticache-client.js';

import type { ReplicationGroup } from '@aws-sdk/client-elasticache';
import type { AwsElasticacheGenericObject } from './elasticache-types.js';

export interface getReplicationGroupsInput {
  identifier: string;
}

export async function getReplicationGroups(): Promise<
  AwsElasticacheGenericObject[]
> {
  const { ReplicationGroups } = await elasticacheClient.send(
    new DescribeReplicationGroupsCommand({})
  );

  if (!ReplicationGroups) {
    throw new Error(`Invalid response from AWS.`);
  }

  return ReplicationGroups.map(cluster => parseElasticacheResponse(cluster));
}

export async function getRawReplicationGroups(): Promise<ReplicationGroup[]> {
  const { ReplicationGroups } = await elasticacheClient.send(
    new DescribeReplicationGroupsCommand({})
  );

  if (!ReplicationGroups) {
    throw new Error(`Invalid response from AWS.`);
  }

  return ReplicationGroups;
}

export async function getReplicationGroupsByClusterMode(): Promise<
  AwsElasticacheGenericObject[][]
> {
  const { ReplicationGroups } = await elasticacheClient.send(
    new DescribeReplicationGroupsCommand({})
  );

  if (!ReplicationGroups) {
    throw new Error(`Invalid response from AWS.`);
  }
  const ClusterModeDisabled = ReplicationGroups.map(cluster =>
    parseElasticacheResponse(cluster)
  ).filter(cluster => cluster.clusterMode === 'disabled');
  const ClusterModeEnabled = ReplicationGroups.map(cluster =>
    parseElasticacheResponse(cluster)
  ).filter(cluster => cluster.clusterMode === 'enabled');
  return [ClusterModeEnabled, ClusterModeDisabled];
}

export async function getReplicationGroup({
  identifier,
}: getReplicationGroupsInput): Promise<
  AwsElasticacheGenericObject | undefined
> {
  try {
    const { ReplicationGroups } = await elasticacheClient.send(
      new DescribeReplicationGroupsCommand({ ReplicationGroupId: identifier })
    );

    if (!ReplicationGroups) {
      throw new Error(`Invalid response from AWS.`);
    }

    return ReplicationGroups.map(cluster =>
      parseElasticacheResponse(cluster)
    )[0];
  } catch (error) {
    if (error instanceof AwsNotFoundError) {
      return undefined;
    }
    throw error;
  }
}
export async function getDescribedreplicationGroup(
  replicationGroupIdentifier: string
): Promise<ReplicationGroup> {
  const cluster = await elasticacheClient.send(
    new DescribeReplicationGroupsCommand({
      ReplicationGroupId: replicationGroupIdentifier,
    })
  );
  if (
    cluster.ReplicationGroups === undefined ||
    cluster.ReplicationGroups[0] === undefined
  ) {
    throw new Error(`Cluster ${replicationGroupIdentifier} not found`);
  }
  return cluster.ReplicationGroups[0];
}
