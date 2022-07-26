import inquirer, { DistinctChoice } from "inquirer";
import { getVpcs } from "../../aws/ec2/get-vpcs.js";
import { getDbClusters } from "../../aws/rds/get-db-clusters.js";
import { getDbInstances } from "../../aws/rds/get-db-instances.js";
import { AwsDbCluster, AwsDbInstance } from "../../aws/rds/rds-types.js";
import { formatName } from "../../common/format-name.js";
import { CustomTarget, DbInstanceTarget, Target } from "../../target/target.js";

export async function selectTarget(): Promise<Target> {
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

  if (target.custom) {
    return promptForCustomTarget();
  }
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

async function promptForCustomTarget(): Promise<CustomTarget> {
  const vpcs = await getVpcs();

  const { vpcId } = await inquirer.prompt({
    type: "list",
    name: "vpcId",
    message: "Select target VPC",
    choices: vpcs.map((vpc) => ({
      name: formatName(vpc),
      value: vpc.id,
    })),
  });

  return { custom: { vpcId } };
}

function toInstanceChoice(
  dbInstance: AwsDbInstance
): DistinctChoice<DbInstanceTarget> {
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
