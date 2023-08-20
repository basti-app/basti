import type { NodeGroup } from '@aws-sdk/client-elasticache';

export interface awsElasticacheCluster {
  identifier: string;
  ClusterMode: string;
  replicationGroupId: string;
  NodeGroups: NodeGroup[];
  host: string;
  port: number;
}

export interface AwsElasticacheSubnetGroup {
  name: string;
  vpcId: string;
}
