import type { AwsDbCluster } from '#src/aws/rds/rds-types.js';

import { ConnectTargetBase } from '../connect-target.js';

import type { ConnectTargetBaseConstructorInput } from '../connect-target.js';

export class DbClusterConnectTarget extends ConnectTargetBase {
  private readonly dbCluster: AwsDbCluster;

  constructor(
    input: ConnectTargetBaseConstructorInput & { dbCluster: AwsDbCluster }
  ) {
    super(input);
    this.dbCluster = input.dbCluster;
  }

  async getHost(): Promise<string> {
    return this.dbCluster.host;
  }

  async getPort(): Promise<number> {
    return this.dbCluster.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    return this.dbCluster.securityGroupIds;
  }
}
