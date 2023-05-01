import { ModifyDBClusterCommand } from '@aws-sdk/client-rds';

import { parseDbClusterResponse } from './parse-rds-response.js';
import { rdsClient } from './rds-client.js';

import type { AwsDbCluster } from './rds-types.js';

export interface ModifyDbClusterInput {
  identifier: string;
  securityGroupIds?: string[];
}

export async function modifyDBCluster({
  identifier,
  securityGroupIds,
}: ModifyDbClusterInput): Promise<AwsDbCluster> {
  const { DBCluster } = await rdsClient.send(
    new ModifyDBClusterCommand({
      DBClusterIdentifier: identifier,
      VpcSecurityGroupIds: securityGroupIds,
    })
  );

  return parseDbClusterResponse(DBCluster);
}
