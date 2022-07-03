import { AwsDbCluster, AwsDbInstance } from "../aws/rds/rds-types.js";

export interface InitTarget {
  getVpcId(): Promise<string>;
  attachSecurityGroup?(securityGroupId: string): Promise<void>;
}
