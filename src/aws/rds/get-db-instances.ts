import { DescribeDBInstancesCommand } from '@aws-sdk/client-rds';

import { AwsNotFoundError } from '../common/aws-errors.js';

import { parseDbInstanceResponse } from './parse-rds-response.js';
import { rdsClient } from './rds-client.js';
import { AwsDbInstance } from './rds-types.js';

export interface GetDbInstanceInput {
  identifier: string;
}

export async function getDbInstances(): Promise<AwsDbInstance[]> {
  const { DBInstances } = await rdsClient.send(
    new DescribeDBInstancesCommand({})
  );

  if (!DBInstances) {
    throw new Error(`Invalid response from AWS.`);
  }

  return DBInstances.map(instance => parseDbInstanceResponse(instance));
}

export async function getDbInstance({
  identifier,
}: GetDbInstanceInput): Promise<AwsDbInstance | undefined> {
  try {
    const { DBInstances } = await rdsClient.send(
      new DescribeDBInstancesCommand({ DBInstanceIdentifier: identifier })
    );

    if (!DBInstances) {
      throw new Error(`Invalid response from AWS.`);
    }

    return DBInstances.map(instance => parseDbInstanceResponse(instance))[0];
  } catch (error) {
    if (error instanceof AwsNotFoundError) {
      return undefined;
    }
    throw error;
  }
}
