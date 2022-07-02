import {
  RDSClient,
  DescribeDBClustersCommand,
  DBCluster,
} from "@aws-sdk/client-rds";

const rdsClient = new RDSClient({ region: "us-east-1" });

export async function getDbClusters(): Promise<DBCluster[]> {
  const { DBClusters: dbClusters } = await rdsClient.send(
    new DescribeDBClustersCommand({})
  );

  return dbClusters || [];
}
