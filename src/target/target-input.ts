import { AwsDbCluster, AwsDbInstance } from "../aws/rds/rds-types.js";

export type InitTargetInput =
  | DbClusterTargetInput
  | DbInstanceTargetInput
  | CustomInitTargetInput;

export type ConnectTargetInput =
  | DbClusterTargetInput
  | DbInstanceTargetInput
  | CustomConnectTargetInput;

export interface DbClusterTargetInput {
  dbCluster: AwsDbCluster;
}

export interface DbInstanceTargetInput {
  dbInstance: AwsDbInstance;
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

export const TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX = "basti-access";
