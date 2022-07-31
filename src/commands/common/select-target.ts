import inquirer, { DistinctChoice } from "inquirer";
import { getDbClusters } from "../../aws/rds/get-db-clusters.js";
import { getDbInstances } from "../../aws/rds/get-db-instances.js";
import { AwsDbCluster, AwsDbInstance } from "../../aws/rds/rds-types.js";
import {
  DbClusterTargetInput,
  DbInstanceTargetInput,
} from "../../target/target-input.js";

export type SelectedTargetInput =
  | DbInstanceTargetInput
  | DbClusterTargetInput
  | { custom: true };

export async function selectTarget(): Promise<SelectedTargetInput> {
  const instances = await getDbInstances();
  const clusters = await getDbClusters();

  const { target } = await inquirer.prompt({
    type: "list",
    name: "target",
    message: "Select target to connect to",
    choices: [
      ...toInstanceChoices(instances),
      ...toClusterChoices(clusters),
      ...getCustomChoices(),
    ],
  });

  return target;
}

function toInstanceChoices(instances: AwsDbInstance[]): DistinctChoice[] {
  if (!instances.length) {
    return [];
  }
  return [
    new inquirer.Separator("Database instances:"),
    ...instances.map(toInstanceChoice),
  ];
}

function toClusterChoices(clusters: AwsDbCluster[]): DistinctChoice[] {
  if (!clusters.length) {
    return [];
  }
  return [
    new inquirer.Separator("Database clusters:"),
    ...clusters.map(toClusterChoice),
  ];
}

function getCustomChoices(): DistinctChoice[] {
  return [
    new inquirer.Separator(),
    {
      name: "Custom",
      value: {
        custom: true,
      },
    },
  ];
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
