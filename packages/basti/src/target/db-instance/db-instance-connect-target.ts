import type { AwsDbInstance } from '#src/aws/rds/rds-types.js';

import { ConnectTargetBase } from '../connect-target.js';

import type { ConnectTargetBaseConstructorInput } from '../connect-target.js';

export class DbInstanceConnectTarget extends ConnectTargetBase {
  private readonly dbInstance: AwsDbInstance;

  constructor(
    input: ConnectTargetBaseConstructorInput & { dbInstance: AwsDbInstance }
  ) {
    super(input);
    this.dbInstance = input.dbInstance;
  }

  async getHost(): Promise<string> {
    return this.dbInstance.host;
  }

  async getPort(): Promise<number> {
    return this.dbInstance.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    return this.dbInstance.securityGroupIds;
  }
}
