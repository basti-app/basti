import inquirer, { DistinctChoice } from "inquirer";
import { getVpcs } from "../../aws/ec2/get-vpcs.js";
import { getDbClusters } from "../../aws/rds/get-db-clusters.js";
import { getDbInstances } from "../../aws/rds/get-db-instances.js";
import { AwsDbCluster, AwsDbInstance } from "../../aws/rds/rds-types.js";
import { formatName } from "../../common/format-name.js";
import { CustomInitTarget } from "../../target/custom/custom-init-target.js";
import { DbClusterInitTarget } from "../../target/db-cluster/db-cluster-init-target.js";
import { DbInstanceInitTarget } from "../../target/db-instance/db-instance-init-target.js";
import { InitTarget } from "../../target/init-target.js";

export async function selectInitTarget(): Promise<InitTarget> {
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

  if (target.instance) {
    return new DbInstanceInitTarget({ dbInstance: target.instance });
  } else if (target.cluster) {
    return new DbClusterInitTarget({ dbCluster: target.cluster });
  }

  return promptForCustomInitTarget();
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

async function promptForCustomInitTarget(): Promise<CustomInitTarget> {
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

  return new CustomInitTarget({ vpcId });
}

function toInstanceChoice(instance: AwsDbInstance): DistinctChoice {
  return {
    name: instance.identifier,
    value: {
      instance,
    },
  };
}

function toClusterChoice(cluster: AwsDbCluster): DistinctChoice {
  return {
    name: cluster.identifier,
    value: {
      cluster,
    },
  };
}
