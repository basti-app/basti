import { DescribeDBClustersCommand } from '@aws-sdk/client-rds';

import { AwsNotFoundError } from '../common/aws-errors.js';

import { parseDbClusterResponse } from './parse-rds-response.js';
import { rdsClient } from './rds-client.js';

import type { AwsDbCluster } from './rds-types.js';

export interface GetDbInstanceInput {
  identifier: string;
}

export async function getDbClusters(): Promise<AwsDbCluster[]> {
  const { DBClusters } = await rdsClient.send(
    new DescribeDBClustersCommand({})
  );

  if (!DBClusters) {
    throw new Error(`Invalid response from AWS.`);
  }

  return DBClusters.map(cluster => parseDbClusterResponse(cluster));
}

export async function getDbCluster({
  identifier,
}: GetDbInstanceInput): Promise<AwsDbCluster | undefined> {
  try {
    const { DBClusters } = await rdsClient.send(
      new DescribeDBClustersCommand({ DBClusterIdentifier: identifier })
    );

    if (!DBClusters) {
      throw new Error(`Invalid response from AWS.`);
    }

    return DBClusters.map(cluster => parseDbClusterResponse(cluster))[0];
  } catch (error) {
    if (error instanceof AwsNotFoundError) {
      return undefined;
    }
    throw error;
  }
}
