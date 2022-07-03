export interface AwsDbCluster {
  identifier: string;

  dbSubnetGroupName: string;
  securityGroupIds: string[];
}

export interface AwsDbInstance {
  identifier: string;
  clusterIdentifier?: string;

  vpcId: string;
  securityGroupIds: string[];
}

export interface AwsDbSubnetGroup {
  name: string;
  vpcId: string;
}
