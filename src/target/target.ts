import { AwsDbCluster, AwsDbInstance } from "../aws/rds/rds-types.js";
import { CustomInitTarget } from "./custom/custom-init-target.js";
import { DbClusterInitTarget } from "./db-cluster/db-cluster-init-target.js";
import { DbInstanceInitTarget } from "./db-instance/db-instance-init-target.js";
import { InitTarget } from "./init-target.js";

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

export function createInitTarget(target: Target): InitTarget {
  if ("dbInstance" in target) {
    return new DbInstanceInitTarget(target);
  }
  if ("dbCluster" in target) {
    return new DbClusterInitTarget(target);
  }
  return new CustomInitTarget(target.custom);
}
