import { DescribeDBClustersCommand } from "@aws-sdk/client-rds";
import { handleRdsErrors } from "./handle-rds-error.js";
import { parseDbClusterResponse } from "./parse-rds-response.js";
import { rdsClient } from "./rds-client.js";
import { AwsDbCluster } from "./rds-types.js";

export async function getDbClusters(): Promise<AwsDbCluster[]> {
  const { DBClusters } = await handleRdsErrors(() =>
    rdsClient.send(new DescribeDBClustersCommand({}))
  );

  if (!DBClusters) {
    throw new Error(`Invalid response from AWS.`);
  }

  return DBClusters.map(parseDbClusterResponse);
}
