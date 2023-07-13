import { DescribeDBSubnetGroupsCommand } from '@aws-sdk/client-rds';

import { AwsNotFoundError } from '../common/aws-errors.js';

import { parseDbSubnetGroup } from './parse-rds-response.js';
import { rdsClient } from './rds-client.js';

import type { AwsDbSubnetGroup } from './rds-types.js';

export interface GetSubnetGroupInput {
  name: string;
}

export async function getDbSubnetGroup({
  name,
}: GetSubnetGroupInput): Promise<AwsDbSubnetGroup | undefined> {
  try {
    const { DBSubnetGroups } = await rdsClient.send(
      new DescribeDBSubnetGroupsCommand({
        DBSubnetGroupName: name,
      })
    );

    if (!DBSubnetGroups) {
      throw new Error(`Invalid response from AWS.`);
    }

    return DBSubnetGroups.map(group => parseDbSubnetGroup(group))[0];
  } catch (error) {
    if (error instanceof AwsNotFoundError) {
      return undefined;
    }
    throw error;
  }
}
