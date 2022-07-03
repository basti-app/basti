import { modifyDbInstance } from "../../aws/rds/modify-db-instance.js";
import { AwsDbInstance } from "../../aws/rds/rds-types.js";
import { InitTarget } from "../init-target.js";

export class DbInstanceInitTarget implements InitTarget {
  private dbInstance: AwsDbInstance;

  constructor({ dbInstance }: { dbInstance: AwsDbInstance }) {
    this.dbInstance = dbInstance;
  }

  async getVpcId(): Promise<string> {
    return this.dbInstance.vpcId;
  }

  async attachSecurityGroup(securityGroupId: string): Promise<void> {
    this.dbInstance = await modifyDbInstance({
      identifier: this.dbInstance.identifier,
      securityGroupIds: [...this.dbInstance.securityGroupIds, securityGroupId],
    });
  }
}
