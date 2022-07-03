import { DescribeDBClustersCommand } from "@aws-sdk/client-rds";
import { parseDbClusterResponse } from "./parse-rds-response.js";
import { rdsClient } from "./rds-client.js";
import { AwsDbCluster } from "./rds-types.js";

export async function getDbClusters(): Promise<AwsDbCluster[]> {
  const { DBClusters } = await rdsClient.send(
    new DescribeDBClustersCommand({})
  );

  if (!DBClusters) {
    throw new Error(`Invalid response from AWS.`);
  }

  return DBClusters.map(parseDbClusterResponse);
}
