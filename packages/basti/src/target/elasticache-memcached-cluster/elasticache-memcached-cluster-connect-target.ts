import type { AwsElasticacheMemcachedCluster } from '#src/aws/elasticache/elasticache-types.js';
import { getCacheClusterSubnetGroup } from '#src/aws/elasticache/get-cache-cluster-subnet-group.js';

import { ConnectTargetBase } from '../connect-target.js';

import type { ConnectTargetBaseConstructorInput } from '../connect-target.js';

export class ElasticacheMemcachedClusterConnectTarget extends ConnectTargetBase {
  private readonly elasticacheMemcachedCluster: AwsElasticacheMemcachedCluster;
  constructor(
    input: ConnectTargetBaseConstructorInput & {
      elasticacheMemcachedCluster: AwsElasticacheMemcachedCluster;
    }
  ) {
    super(input);
    this.elasticacheMemcachedCluster = input.elasticacheMemcachedCluster;
  }

  async getHost(): Promise<string> {
    return this.elasticacheMemcachedCluster.host;
  }

  async getPort(): Promise<number> {
    return this.elasticacheMemcachedCluster.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    return this.elasticacheMemcachedCluster.securityGroups;
  }

  async getVpcId(): Promise<string> {
    const dbSubnetGroup = await getCacheClusterSubnetGroup({
      name: this.elasticacheMemcachedCluster.subnetGroupName,
    });

    if (!dbSubnetGroup) {
      throw new Error(
        `Cluster subnet group "${this.elasticacheMemcachedCluster.subnetGroupName}" not found`
      );
    }

    return dbSubnetGroup.vpcId;
  }
}
