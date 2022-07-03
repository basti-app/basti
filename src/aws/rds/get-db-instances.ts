import { DescribeDBInstancesCommand } from "@aws-sdk/client-rds";
import { z } from "zod";
import { parseDbInstanceResponse } from "./parse-rds-response.js";
import { rdsClient } from "./rds-client.js";
import { AwsDbInstance } from "./rds-types.js";

export async function getDbInstances(): Promise<AwsDbInstance[]> {
  const { DBInstances } = await rdsClient.send(
    new DescribeDBInstancesCommand({})
  );

  if (!DBInstances) {
    throw new Error(`Invalid response from AWS.`);
  }

  return DBInstances.map(parseDbInstanceResponse);
}
