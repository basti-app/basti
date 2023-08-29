import type { NodeGroup } from '@aws-sdk/client-elasticache';

export interface AwsElasticacheGenericObject {
  identifier: string;
  clusterMode: string;
  replicationGroupId: string;
  nodeGroups: NodeGroup[];
  host: string;
  port: number;
}

export interface AwsElasticacheSubnetGroup {
  name: string;
  vpcId: string;
}
