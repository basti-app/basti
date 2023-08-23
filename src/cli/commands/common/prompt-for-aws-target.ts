import inquirer from 'inquirer';

import { getReplicationGroupsByClusterMode } from '#src/aws/elasticache/get-elasticache-replication-groups.js';
import { getCacheClusters } from '#src/aws/elasticache/get-elasticache-cache-clusters.js';
import type { AwsElasticacheGenericObject } from '#src/aws/elasticache/elasticache-types.js';
import {
  parseNodeGroupMemberResponseFunction,
  parseNodeGroupResponseFunction,
} from '#src/aws/elasticache/parse-elasticache-response.js';
import { getDbClusters } from '#src/aws/rds/get-db-clusters.js';
import { getDbInstances } from '#src/aws/rds/get-db-instances.js';
import type { AwsDbCluster, AwsDbInstance } from '#src/aws/rds/rds-types.js';
import type { Cli } from '#src/common/cli.js';
import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';
import type {
  DbClusterTargetInput,
  DbInstanceTargetInput,
  ElasticacheClusterTargetInput,
} from '#src/target/target-input.js';

import { getErrorDetail } from '../../error/get-error-detail.js';

import type { NodeGroup } from '@aws-sdk/client-elasticache';
import type { DistinctChoice } from 'inquirer';

export type AwsTargetInput =
  | DbInstanceTargetInput
  | DbClusterTargetInput
  | ElasticacheClusterTargetInput;

export async function promptForAwsTarget(
  commandType: string
): Promise<AwsTargetInput | undefined> {
  const {
    instances,
    clusters,
    elasticacheReplicationGroups: elasticacheClusters,
    elasticacheCacheClusters: elasticacheNodes,
  } = await getTargets();

  const { target } = await cli.prompt({
    type: 'list',
    name: 'target',
    message: 'Select target to connect to',
    choices: [
      ...toInstanceChoices(instances),
      ...toClusterChoices(clusters),
      ...toElasticacheClusterChoices(
        elasticacheClusters,
        commandType,
        elasticacheNodes
      ),
      ...getCustomChoices(),
    ],
  });

  return target;
}

async function getTargets(): Promise<{
  instances: AwsDbInstance[];
  clusters: AwsDbCluster[];
  elasticacheReplicationGroups: AwsElasticacheGenericObject[][];
  elasticacheCacheClusters: AwsElasticacheGenericObject[];
}> {
  const subCli = cli.createSubInstance({ indent: 2 });

  cli.out(`${fmt.green('❯')} Retrieving connection targets:`);

  const instances = await getTargetResources(
    async () => await getDbInstances(),
    'DB instances',
    subCli
  );

  const clusters = await getTargetResources(
    async () => await getDbClusters(),
    'DB clusters',
    subCli
  );
  const elasticacheClusters = await getTargetResources(
    async () => await getReplicationGroupsByClusterMode(),
    'Elasticache replication groups',
    subCli
  );

  const elasticacheNodes = await getTargetResources(
    async () => await getCacheClusters(),
    'Elasticache cache clusters',
    subCli
  );
  return {
    instances,
    clusters,
    elasticacheReplicationGroups: elasticacheClusters,
    elasticacheCacheClusters: elasticacheNodes,
  };
}

function toInstanceChoices(instances: AwsDbInstance[]): DistinctChoice[] {
  if (instances.length === 0) {
    return [];
  }
  return [
    new inquirer.Separator('Database instances:'),
    ...instances.map(instance => toInstanceChoice(instance)),
  ];
}

function toClusterChoices(clusters: AwsDbCluster[]): DistinctChoice[] {
  if (clusters.length === 0) {
    return [];
  }
  return [
    new inquirer.Separator('Database clusters:'),
    ...clusters.map(cluster => toClusterChoice(cluster)),
  ];
}

function getCustomChoices(): DistinctChoice[] {
  return [
    new inquirer.Separator(),
    {
      name: 'Custom',
      value: undefined,
    },
  ];
}

async function getTargetResources<T>(
  getResources: () => Promise<T[]>,
  resourceName: string,
  cli: Cli
): Promise<T[]> {
  try {
    cli.progressStart(resourceName);
    const resources = await getResources();
    cli.progressSuccess();
    return resources;
  } catch (error) {
    const warnText = getErrorDetail(error);

    cli.progressWarn({ warnText });
    return [];
  }
}

function toInstanceChoice(
  dbInstance: AwsDbInstance
): DistinctChoice<DbInstanceTargetInput> {
  return {
    name: dbInstance.identifier,
    value: {
      dbInstance,
    },
  };
}

function toClusterChoice(dbCluster: AwsDbCluster): DistinctChoice {
  return {
    name: dbCluster.identifier,
    value: {
      dbCluster,
    },
  };
}
function toElasticacheClusterChoices(
  clusters: AwsElasticacheGenericObject[][],
  commandType: string,
  cacheClusters: AwsElasticacheGenericObject[]
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
    new inquirer.Separator('redis clusters:'),
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
  if (clustermMode === 'clusterModeEnabled') {
    let arr: Array<Array<DistinctChoice<ElasticacheClusterTargetInput>>> = [];
    arr = clusters.map(clusterModeEnabled =>
      toElasticacheReplicationGroupChoises(clusterModeEnabled, cacheClusters)
    );
    return arr.flat();
  } else {
    let arr: Array<Array<DistinctChoice<ElasticacheClusterTargetInput>>> = [];
    arr = clusters.map(clusterModeDisabled =>
      toClusterModeDisabledReplicationGroups(clusterModeDisabled)
    );
    return arr.flat();
  }
}
function toElasticacheReplicationGroupChoises(
  replicationGroup: AwsElasticacheGenericObject,
  cacheClusters: AwsElasticacheGenericObject[]
): Array<DistinctChoice<ElasticacheClusterTargetInput>> {
  return [
    {
      name: replicationGroup.identifier + '- Configuration Endpoint',
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
  const unFlat = elasticacheReplicationGroup.nodeGroups.map(nodeGroup =>
    toClusterModeEnabledChoicesFromNodeGroup(
      nodeGroup,
      elasticacheCacheCluster,
      elasticacheReplicationGroup.identifier
    )
  );
  return [...unFlat.flat()];
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
          ` Shard ${elasticacheNodeGroup.NodeGroupId ?? ' '}`
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
      name: elasticacheCluster.replicationGroupId.concat('- Primary Endpoint'),

      value: {
        elasticacheCluster: parseNodeGroupResponseFunction(
          NodeGroup,
          elasticacheCluster.replicationGroupId
        ),
      },
    },
    ...NodeGroup.NodeGroupMembers.map(member => {
      return {
        name: '   '.concat(member.CacheClusterId!, ' - ', member.CurrentRole!),
        value: {
          elasticacheCluster: parseNodeGroupMemberResponseFunction(
            member,
            elasticacheCluster.replicationGroupId
          ),
        },
      };
    }),
    new inquirer.Separator(' '),
  ];
}
