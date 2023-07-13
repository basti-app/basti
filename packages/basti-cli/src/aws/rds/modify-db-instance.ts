import { ModifyDBInstanceCommand } from '@aws-sdk/client-rds';

import { parseDbInstanceResponse } from './parse-rds-response.js';
import { rdsClient } from './rds-client.js';

import type { AwsDbInstance } from './rds-types.js';

export interface ModifyDbInstanceInput {
  identifier: string;
  securityGroupIds?: string[];
}

export async function modifyDbInstance({
  identifier,
  securityGroupIds,
}: ModifyDbInstanceInput): Promise<AwsDbInstance> {
  const { DBInstance } = await rdsClient.send(
    new ModifyDBInstanceCommand({
      DBInstanceIdentifier: identifier,
      VpcSecurityGroupIds: securityGroupIds,
    })
  );

  return parseDbInstanceResponse(DBInstance);
}
