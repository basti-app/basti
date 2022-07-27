import { AwsDbCluster, AwsDbInstance } from "../aws/rds/rds-types.js";

export type Target = DbClusterTarget | DbInstanceTarget | CustomTarget;

export interface DbClusterTarget {
  dbCluster: AwsDbCluster;
}

export interface DbInstanceTarget {
  dbInstance: AwsDbInstance;
}

export interface CustomTarget {
  custom: {
    vpcId: string;
  };
}

export const TARGET_ACCESS_SECURITY_GROUP_NAME_PREFIX = "basti-access";
