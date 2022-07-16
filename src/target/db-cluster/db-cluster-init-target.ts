import { getDbSubnetGroup } from "../../aws/rds/get-db-subnet-group.js";
import { modifyDBCluster } from "../../aws/rds/modify-db-cluster.js";
import { AwsDbCluster } from "../../aws/rds/rds-types.js";
import { SecurityGroupInitTarget } from "../init-target.js";

export class DbClusterInitTarget extends SecurityGroupInitTarget {
  private dbCluster: AwsDbCluster;

  constructor({ dbCluster }: { dbCluster: AwsDbCluster }) {
    super();
    this.dbCluster = dbCluster;
  }

  async getVpcId(): Promise<string> {
    const optionalDbSubnetGroup = await getDbSubnetGroup({
      name: this.dbCluster.dbSubnetGroupName,
    });

    if (!optionalDbSubnetGroup) {
      throw new Error(
        `Can't get DB subnet group for name "${this.dbCluster.dbSubnetGroupName}".`
      );
    }

    return optionalDbSubnetGroup.vpcId;
  }

  protected getTargetPort(): number {
    return this.dbCluster.port;
  }

  protected async attachSecurityGroup(securityGroupId: string): Promise<void> {
    this.dbCluster = await modifyDBCluster({
      identifier: this.dbCluster.identifier,
      securityGroupIds: [...this.dbCluster.securityGroupIds, securityGroupId],
    });
  }
}
