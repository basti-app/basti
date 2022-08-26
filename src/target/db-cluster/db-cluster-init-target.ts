import { getDbSubnetGroup } from "../../aws/rds/get-db-subnet-group.js";
import { modifyDBCluster } from "../../aws/rds/modify-db-cluster.js";
import { AwsDbCluster } from "../../aws/rds/rds-types.js";
import { InitTargetBase } from "../init-target.js";

export class DbClusterInitTarget extends InitTargetBase {
  private dbCluster: AwsDbCluster;

  constructor({ dbCluster }: { dbCluster: AwsDbCluster }) {
    super();
    this.dbCluster = dbCluster;
  }

  getId(): string {
    return this.dbCluster.identifier;
  }

  async getVpcId(): Promise<string> {
    const dbSubnetGroup = await getDbSubnetGroup({
      name: this.dbCluster.dbSubnetGroupName,
    });

    if (!dbSubnetGroup) {
      throw new Error(
        `DB subnet group "${this.dbCluster.dbSubnetGroupName}" not found`
      );
    }

    return dbSubnetGroup.vpcId;
  }

  protected getTargetPort(): number {
    return this.dbCluster.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    return this.dbCluster.securityGroupIds;
  }

  protected async attachSecurityGroup(securityGroupId: string): Promise<void> {
    this.dbCluster = await modifyDBCluster({
      identifier: this.dbCluster.identifier,
      securityGroupIds: [...this.dbCluster.securityGroupIds, securityGroupId],
    });
  }
}
