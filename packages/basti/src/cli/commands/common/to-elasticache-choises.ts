import inquirer from 'inquirer';

import {
  parseElasticacheMemcachedCacheNode,
  parseMemcachedCacheClusterResponse,
} from '#src/aws/elasticache/parse-elasticache-memcached-response.js';
import {
  parseNodeGroupMemberResponse,
  parseNodeGroupResponse,
} from '#src/aws/elasticache/parse-elasticache-redis-response.js';
import type {
  AwsElasticacheGenericObject,
  AwsElasticacheMemcachedCluster,
} from '#src/aws/elasticache/elasticache-types.js';
import type { ElasticacheRedisClusterTargetInput } from '#src/target/target-input.js';
import { fmt } from '#src/common/fmt.js';

import type { CacheCluster, NodeGroup } from '@aws-sdk/client-elasticache';
import type { DistinctChoice } from 'inquirer';

export function toElasticacheChoices(
  redisClusters: AwsElasticacheGenericObject[][],
  cacheClusters: AwsElasticacheGenericObject[],
  memcachedClusters: AwsElasticacheMemcachedCluster[],
  memcachedRawClusters: CacheCluster[],
  commandType: string
): DistinctChoice[] {
  return [
    new inquirer.Separator('Elasticache Targets:'),
    ...toElasticacheClusterChoices(redisClusters, cacheClusters, commandType),
    ...toElasticacheMemcachedClusterChoices(
      memcachedClusters,
      memcachedRawClusters,
      commandType
    ),
  ];
}

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
        new inquirer.Separator(' Redis clusters:'),
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
): Array<DistinctChoice<ElasticacheRedisClusterTargetInput>> {
  return [
    new inquirer.Separator(' Redis clusters:'),
    ...clusters[0]!.map(cluster => toElasticacheClusterChoice(cluster)),
    ...clusters[1]!.map(cluster => toElasticacheClusterChoice(cluster)),
  ];
}

function toConnectElasticacheClusterChoices(
  clusters: AwsElasticacheGenericObject[] | undefined,
  cacheClusters: AwsElasticacheGenericObject[],
  clustermMode: string
): Array<DistinctChoice<ElasticacheRedisClusterTargetInput>> {
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
): Array<DistinctChoice<ElasticacheRedisClusterTargetInput>> {
  return [
    {
      name: '  ' + replicationGroup.identifier + ' - Configuration endpoint',
      value: { elasticacheRedisCluster: replicationGroup },
    },
    ...toClusterModeEnabledChoicesFromNodeGroups(
      replicationGroup,
      cacheClusters
    ),
  ];
}

function toElasticacheClusterChoice(
  elasticacheRedisCluster: AwsElasticacheGenericObject
): DistinctChoice<ElasticacheRedisClusterTargetInput> {
  return {
    name: '  ' + elasticacheRedisCluster.identifier,
    value: {
      elasticacheRedisCluster,
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
          `   Shard ${elasticacheNodeGroup.NodeGroupId ?? ' '}`
        ),
        ...elasticacheNodeGroup.NodeGroupMembers.map(member => {
          const cacheCluster = elasticacheCacheCluster.find(cache => {
            return cache.identifier === member.CacheClusterId;
          })!;
          cacheCluster.replicationGroupId = replicationGroupId;
          return {
            name: '    '.concat(member.CacheClusterId!),
            value: { elasticacheRedisCluster: cacheCluster },
          };
        }),
      ];
}

function toClusterModeDisabledReplicationGroups(
  elasticacheRedisCluster: AwsElasticacheGenericObject
): Array<DistinctChoice<ElasticacheRedisClusterTargetInput>> {
  const NodeGroup = elasticacheRedisCluster.nodeGroups[0]!;
  if (
    NodeGroup.NodeGroupMembers === undefined ||
    NodeGroup.NodeGroupMembers.length === 0
  )
    return [];
  return [
    {
      name:
        '  ' +
        elasticacheRedisCluster.replicationGroupId.concat(
          ' - Primary endpoint'
        ),

      value: {
        elasticacheRedisCluster: parseNodeGroupResponse(
          NodeGroup,
          elasticacheRedisCluster.replicationGroupId
        ),
      },
    },
    ...NodeGroup.NodeGroupMembers.map(member => {
      return {
        name: '   '.concat(
          member.CacheClusterId!,
          ' - ',
          fmt.capitalize(member.CurrentRole ?? 'Node')
        ),
        value: {
          elasticacheRedisCluster: parseNodeGroupMemberResponse(
            member,
            elasticacheRedisCluster.replicationGroupId
          ),
        },
      };
    }),
  ];
}
export function toElasticacheMemcachedClusterChoices(
  clusters: AwsElasticacheMemcachedCluster[],
  rawClusters: CacheCluster[],
  commandType: string
): inquirer.DistinctChoice[] {
  if (clusters === undefined || clusters.length === 0) return [];

  return commandType === 'init'
    ? toInitElasticacheMemcachedChoices(clusters)
    : [
        new inquirer.Separator(' Memcached clusters:'),
        ...toConnectElasticacheMemcachedClusterChoices(rawClusters),
      ];
}

function toInitElasticacheMemcachedChoices(
  clusters: AwsElasticacheMemcachedCluster[]
): Array<DistinctChoice<ElasticacheRedisClusterTargetInput>> {
  return [
    new inquirer.Separator(' Memcached clusters:'),
    ...clusters.map(cluster =>
      toElasticacheMemcachedClusterChoice(cluster, 'init')
    ),
  ];
}

function toElasticacheMemcachedClusterChoice(
  elasticacheMemcachedCluster: AwsElasticacheMemcachedCluster,
  commandType: string
): DistinctChoice<ElasticacheRedisClusterTargetInput> {
  return commandType === 'init'
    ? {
        name: '  ' + elasticacheMemcachedCluster.identifier,
        value: {
          elasticacheMemcachedCluster,
        },
      }
    : {
        name:
          '  ' +
          elasticacheMemcachedCluster.identifier.concat(
            ' - Configuration endpoint'
          ),
        value: {
          elasticacheMemcachedCluster,
        },
      };
}

function toElasticacheMemcachedNodeChoice(
  elasticacheMemcachedCluster: AwsElasticacheMemcachedCluster
): DistinctChoice<ElasticacheRedisClusterTargetInput> {
  return {
    name:
      '   ' +
      elasticacheMemcachedCluster.clusterId +
      '-' +
      elasticacheMemcachedCluster.identifier,
    value: {
      elasticacheMemcachedCluster,
    },
  };
}

function toConnectElasticacheMemcachedClusterChoices(
  cacheClusters: CacheCluster[]
): Array<DistinctChoice<ElasticacheRedisClusterTargetInput>> {
  if (cacheClusters === undefined) return [];
  return cacheClusters.flatMap(memCluster => toMemcachedCluster(memCluster));
}

function toMemcachedCluster(memCluster: CacheCluster): DistinctChoice[] {
  return [
    toElasticacheMemcachedClusterChoice(
      parseMemcachedCacheClusterResponse(memCluster),
      'connect'
    ),
    ...memCluster.CacheNodes!.map(cacheNode =>
      toElasticacheMemcachedNodeChoice(
        parseElasticacheMemcachedCacheNode(
          memCluster,
          memCluster.CacheClusterId!.concat('-', cacheNode.CacheNodeId!)
        )
      )
    ),
  ];
}
