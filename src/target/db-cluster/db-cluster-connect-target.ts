import { AwsDbCluster } from "../../aws/rds/rds-types.js";
import { ConnectTargetBase } from "../connect-target.js";

export class DbClusterConnectTarget extends ConnectTargetBase {
  private readonly dbCluster: AwsDbCluster;

  constructor({ dbCluster }: { dbCluster: AwsDbCluster }) {
    super();
    this.dbCluster = dbCluster;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    return this.dbCluster.securityGroupIds;
  }
}
