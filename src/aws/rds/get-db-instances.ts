import { DescribeDBInstancesCommand } from "@aws-sdk/client-rds";
import { handleRdsErrors } from "./handle-rds-error.js";
import { parseDbInstanceResponse } from "./parse-rds-response.js";
import { rdsClient } from "./rds-client.js";
import { AwsDbInstance } from "./rds-types.js";

export async function getDbInstances(): Promise<AwsDbInstance[]> {
  const { DBInstances } = await handleRdsErrors(() =>
    rdsClient.send(new DescribeDBInstancesCommand({}))
  );

  if (!DBInstances) {
    throw new Error(`Invalid response from AWS.`);
  }

  return DBInstances.map(parseDbInstanceResponse);
}
