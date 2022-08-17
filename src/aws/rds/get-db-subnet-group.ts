import { DescribeDBSubnetGroupsCommand } from "@aws-sdk/client-rds";
import { handleRdsErrors } from "./handle-rds-error.js";
import { parseDbSubnetGroup } from "./parse-rds-response.js";
import { rdsClient } from "./rds-client.js";
import { AwsDbSubnetGroup } from "./rds-types.js";

export interface GetSubnetGroupInput {
  name: string;
}

export async function getDbSubnetGroup({
  name,
}: GetSubnetGroupInput): Promise<AwsDbSubnetGroup | undefined> {
  const { DBSubnetGroups } = await handleRdsErrors(() =>
    rdsClient.send(
      new DescribeDBSubnetGroupsCommand({
        DBSubnetGroupName: name,
      })
    )
  );

  if (!DBSubnetGroups) {
    throw new Error(`Invalid response from AWS.`);
  }

  return DBSubnetGroups[0] ? parseDbSubnetGroup(DBSubnetGroups[0]) : undefined;
}
