export interface AwsDbCluster {
  identifier: string;

  dbSubnetGroupName: string;
  securityGroupIds: string[];

  host: string;
  port: number;
}

export interface AwsDbInstance {
  identifier: string;
  clusterIdentifier?: string;

  vpcId: string;
  securityGroupIds: string[];

  host: string;
  port: number;
}

export interface AwsDbSubnetGroup {
  name: string;
  vpcId: string;
}
