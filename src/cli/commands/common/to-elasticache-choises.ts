import inquirer from 'inquirer';

import {
  parseNodeGroupMemberResponse,
  parseNodeGroupResponse,
} from '#src/aws/elasticache/parse-elasticache-response.js';
import type { AwsElasticacheGenericObject } from '#src/aws/elasticache/elasticache-types.js';
import type { ElasticacheClusterTargetInput } from '#src/target/target-input.js';

import type { NodeGroup } from '@aws-sdk/client-elasticache';
import type { DistinctChoice } from 'inquirer';

export function toElasticacheClusterChoices(
  clusters: AwsElasticacheGenericObject[][],
  cacheClusters: AwsElasticacheGenericObject[],
  commandType: string
): DistinctChoice[] {
  if (
    clusters.length < 2 ||
    ((clusters[0] === undefined || clusters[0].length === 0) &&
      (clusters[1] === undefined || clusters[1].length === 0))
  ) {
    return [];
  }
  return commandType === 'init'
    ? toInitElasticacheClusterChoices(clusters)
    : [
        new inquirer.Separator('Redis clusters:'),
        ...toConnectElasticacheClusterChoices(
          clusters[0],
          cacheClusters,
          'clusterModeEnabled'
        ),
        ...toConnectElasticacheClusterChoices(
          clusters[1],
          cacheClusters,
          'clusterModeDisabled'
        ),
      ];
}

function toInitElasticacheClusterChoices(
  clusters: AwsElasticacheGenericObject[][]
): Array<DistinctChoice<ElasticacheClusterTargetInput>> {
  return [
    new inquirer.Separator('Redis clusters:'),
    ...clusters[0]!.map(cluster => toElasticacheClusterChoice(cluster)),
    ...clusters[1]!.map(cluster => toElasticacheClusterChoice(cluster)),
  ];
}

function toConnectElasticacheClusterChoices(
  clusters: AwsElasticacheGenericObject[] | undefined,
  cacheClusters: AwsElasticacheGenericObject[],
  clustermMode: string
): Array<DistinctChoice<ElasticacheClusterTargetInput>> {
  if (clusters === undefined) return [];
  return clustermMode === 'clusterModeEnabled'
    ? clusters.flatMap(clusterModeEnabled =>
        toElasticacheReplicationGroupChoises(clusterModeEnabled, cacheClusters)
      )
    : clusters.flatMap(clusterModeDisabled =>
        toClusterModeDisabledReplicationGroups(clusterModeDisabled)
      );
}

function toElasticacheReplicationGroupChoises(
  replicationGroup: AwsElasticacheGenericObject,
  cacheClusters: AwsElasticacheGenericObject[]
): Array<DistinctChoice<ElasticacheClusterTargetInput>> {
  return [
    {
      name: replicationGroup.identifier + ' - Configuration endpoint',
      value: { elasticacheCluster: replicationGroup },
    },
    ...toClusterModeEnabledChoicesFromNodeGroups(
      replicationGroup,
      cacheClusters
    ),
    new inquirer.Separator(' '),
  ];
}

function toElasticacheClusterChoice(
  elasticacheCluster: AwsElasticacheGenericObject
): DistinctChoice<ElasticacheClusterTargetInput> {
  return {
    name: elasticacheCluster.identifier,
    value: {
      elasticacheCluster,
    },
  };
}

function toClusterModeEnabledChoicesFromNodeGroups(
  elasticacheReplicationGroup: AwsElasticacheGenericObject,
  elasticacheCacheCluster: AwsElasticacheGenericObject[]
): DistinctChoice[] {
  return elasticacheReplicationGroup.nodeGroups.flatMap(nodeGroup =>
    toClusterModeEnabledChoicesFromNodeGroup(
      nodeGroup,
      elasticacheCacheCluster,
      elasticacheReplicationGroup.identifier
    )
  );
}

function toClusterModeEnabledChoicesFromNodeGroup(
  elasticacheNodeGroup: NodeGroup,
  elasticacheCacheCluster: AwsElasticacheGenericObject[],
  replicationGroupId: string
): DistinctChoice[] {
  return elasticacheNodeGroup.NodeGroupMembers === undefined
    ? []
    : [
        new inquirer.Separator(
          `  Shard ${elasticacheNodeGroup.NodeGroupId ?? ' '}`
        ),
        ...elasticacheNodeGroup.NodeGroupMembers.map(member => {
          const cacheCluster = elasticacheCacheCluster.find(cache => {
            return cache.identifier === member.CacheClusterId;
          })!;
          cacheCluster.replicationGroupId = replicationGroupId;
          return {
            name: '   '.concat(member.CacheClusterId!),
            value: { elasticacheCluster: cacheCluster },
          };
        }),
      ];
}

function toClusterModeDisabledReplicationGroups(
  elasticacheCluster: AwsElasticacheGenericObject
): Array<DistinctChoice<ElasticacheClusterTargetInput>> {
  const NodeGroup = elasticacheCluster.nodeGroups[0]!;
  if (
    NodeGroup.NodeGroupMembers === undefined ||
    NodeGroup.NodeGroupMembers.length === 0
  )
    return [];
  return [
    {
      name: elasticacheCluster.replicationGroupId.concat(' - Primary endpoint'),

      value: {
        elasticacheCluster: parseNodeGroupResponse(
          NodeGroup,
          elasticacheCluster.replicationGroupId
        ),
      },
    },
    ...NodeGroup.NodeGroupMembers.map(member => {
      return {
        name: '  '.concat(member.CacheClusterId!, ' - ', member.CurrentRole!),
        value: {
          elasticacheCluster: parseNodeGroupMemberResponse(
            member,
            elasticacheCluster.replicationGroupId
          ),
        },
      };
    }),
    new inquirer.Separator(' '),
  ];
}
