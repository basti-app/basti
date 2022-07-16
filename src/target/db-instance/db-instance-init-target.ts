import { modifyDbInstance } from "../../aws/rds/modify-db-instance.js";
import { AwsDbInstance } from "../../aws/rds/rds-types.js";
import { SecurityGroupInitTarget } from "../init-target.js";

export class DbInstanceInitTarget extends SecurityGroupInitTarget {
  private dbInstance: AwsDbInstance;

  constructor({ dbInstance }: { dbInstance: AwsDbInstance }) {
    super();
    this.dbInstance = dbInstance;
  }

  async getVpcId(): Promise<string> {
    return this.dbInstance.vpcId;
  }

  protected getTargetPort(): number {
    return this.dbInstance.port;
  }

  protected async attachSecurityGroup(securityGroupId: string): Promise<void> {
    this.dbInstance = await modifyDbInstance({
      identifier: this.dbInstance.identifier,
      securityGroupIds: [...this.dbInstance.securityGroupIds, securityGroupId],
    });
  }
}
