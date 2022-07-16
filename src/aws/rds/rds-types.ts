export interface AwsDbCluster {
  identifier: string;

  dbSubnetGroupName: string;
  securityGroupIds: string[];
  port: number;
}

export interface AwsDbInstance {
  identifier: string;
  clusterIdentifier?: string;

  vpcId: string;
  securityGroupIds: string[];
  port: number;
}

export interface AwsDbSubnetGroup {
  name: string;
  vpcId: string;
}
