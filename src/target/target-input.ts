import type { AwsClientConfiguration } from '#src/aws/common/aws-client.js';

import type { AwsDbCluster, AwsDbInstance } from '../aws/rds/rds-types.js';
import type { awsElasticacheCluster } from '../aws/elasticache/elasticache-types.js';
export type InitTargetInput =
  | DbClusterTargetInput
  | DbInstanceTargetInput
  | ElasticacheClusterTargetInput
  | CustomInitTargetInput;

export type ConnectTargetInput = (
  | DbClusterTargetInput
  | DbInstanceTargetInput
  | ElasticacheClusterTargetInput
  | CustomConnectTargetInput
) & {
  awsClientConfig?: AwsClientConfiguration;
};

export interface DbClusterTargetInput {
  dbCluster: AwsDbCluster;
}

export interface DbInstanceTargetInput {
  dbInstance: AwsDbInstance;
}
export interface ElasticacheClusterTargetInput {
  elasticacheCluster: awsElasticacheCluster;
}

export interface CustomInitTargetInput {
  custom: {
    vpcId: string;
  };
}

export interface CustomConnectTargetInput {
  custom: {
    vpcId: string;
    host: string;
    port: number;
  };
}

export const TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX = 'basti-access';
