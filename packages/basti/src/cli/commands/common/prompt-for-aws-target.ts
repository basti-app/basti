import inquirer from 'inquirer';

import { getReplicationGroupsByClusterMode } from '#src/aws/elasticache/get-elasticache-replication-groups.js';
import { getCacheClusters } from '#src/aws/elasticache/get-elasticache-cache-clusters.js';
import type { AwsElasticacheGenericObject } from '#src/aws/elasticache/elasticache-types.js';
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

import { toElasticacheClusterChoices } from './to-elasticache-choises.js';

import type { DistinctChoice } from 'inquirer';

export type AwsTargetInput =
  | DbInstanceTargetInput
  | DbClusterTargetInput
  | ElasticacheClusterTargetInput;

export async function promptForAwsTarget(
  commandType: string
): Promise<AwsTargetInput | undefined> {
  const { instances, clusters, elasticacheClusters, elasticacheNodes } =
    await getTargets();

  const { target } = await cli.prompt({
    type: 'list',
    pageSize: 20,
    name: 'target',
    message:
      commandType === 'init'
        ? 'Select target to initialize'
        : 'Select target to connect to',
    choices: [
      ...toInstanceChoices(instances),
      ...toClusterChoices(clusters),
      ...toElasticacheClusterChoices(
        elasticacheClusters,
        elasticacheNodes,
        commandType
      ),
      ...getCustomChoices(),
    ],
  });

  return target;
}

async function getTargets(): Promise<{
  instances: AwsDbInstance[];
  clusters: AwsDbCluster[];
  elasticacheClusters: AwsElasticacheGenericObject[][];
  elasticacheNodes: AwsElasticacheGenericObject[];
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
    'Redis clusters',
    subCli
  );

  const elasticacheNodes = await getTargetResources(
    async () => await getCacheClusters(),
    'Redis nodes',
    subCli
  );
  return {
    instances,
    clusters,
    elasticacheClusters,
    elasticacheNodes,
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
