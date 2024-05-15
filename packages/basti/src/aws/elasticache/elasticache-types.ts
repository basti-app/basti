import type { NodeGroup, CacheNode } from '@aws-sdk/client-elasticache';

export interface AwsElasticacheRedisGenericObject {
  identifier: string;
  clusterMode: string;
  replicationGroupId: string;
  nodeGroups: NodeGroup[];
  host: string;
  port: number;
}
export interface AwsElasticacheMemcachedCluster {
  identifier: string;
  type: string;
  host: string;
  port: number;
  subnetGroupName: string;
  cacneNodes: CacheNode[];
  securityGroups: string[];
  clusterId: string;
}

export interface AwsElasticacheServerlessCache {
  identifier: string;
  host: string;
  port: number;
  reader: boolean;
  subnetGroupName: string[];
  securityGroups: string[];
}

export interface AwsElasticacheSubnetGroup {
  name: string;
  vpcId: string;
}
