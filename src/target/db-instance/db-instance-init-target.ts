import { modifyDbInstance } from '#src/aws/rds/modify-db-instance.js';
import type { AwsDbInstance } from '#src/aws/rds/rds-types.js';

import { InitTargetBase } from '../init-target.js';

export class DbInstanceInitTarget extends InitTargetBase {
  private dbInstance: AwsDbInstance;

  constructor({ dbInstance }: { dbInstance: AwsDbInstance }) {
    super();
    this.dbInstance = dbInstance;
  }

  getId(): string {
    return this.dbInstance.identifier;
  }

  async getVpcId(): Promise<string> {
    return this.dbInstance.vpcId;
  }

  protected getTargetPort(): number {
    return this.dbInstance.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    return this.dbInstance.securityGroupIds;
  }

  protected async attachSecurityGroup(securityGroupId: string): Promise<void> {
    this.dbInstance = await modifyDbInstance({
      identifier: this.dbInstance.identifier,
      securityGroupIds: [...this.dbInstance.securityGroupIds, securityGroupId],
    });
  }
}
