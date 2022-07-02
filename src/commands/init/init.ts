import inquirer from "inquirer";

import { getDbClusters } from "../../aws/rds.js";

export async function handleInit(...args: any): Promise<void> {
  const clusters = await getDbClusters();

  const selectedCluster = await inquirer.prompt({
    type: "list",
    name: "cluster",
    message: "What DB cluster to connect to?",
    choices: clusters.map((cluster) => ({
      name: cluster.DBClusterIdentifier,
      value: cluster.DBClusterIdentifier,
    })),
  });

  console.log(selectedCluster);
}
