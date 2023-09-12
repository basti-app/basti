import { getCacheClusterSubnetGroup } from '#src/aws/elasticache/get-cache-cluster-subnet-group.js';
import { modifyElasticacheMemcachedCluster } from '#src/aws/elasticache/modify-elasticache-clusters.js';
import type { AwsElasticacheMemcachedCluster } from '#src/aws/elasticache/elasticache-types.js';

import { InitTargetBase } from '../init-target.js';

export class ElasticacheMemcachedClusterInitTarget extends InitTargetBase {
  private readonly elasticacheMemcachedCluster: AwsElasticacheMemcachedCluster;
  constructor({
    elasticacheMemcachedCluster,
  }: {
    elasticacheMemcachedCluster: AwsElasticacheMemcachedCluster;
  }) {
    super();
    this.elasticacheMemcachedCluster = elasticacheMemcachedCluster;
  }

  getId(): string {
    return this.elasticacheMemcachedCluster.identifier;
  }

  async getVpcId(): Promise<string> {
    const elasticacheSubnetGroup = await getCacheClusterSubnetGroup({
      name: this.elasticacheMemcachedCluster.subnetGroupName,
    });

    if (!elasticacheSubnetGroup) {
      throw new Error(
        `Cluster subnet group "${this.elasticacheMemcachedCluster.subnetGroupName}" not found`
      );
    }

    return elasticacheSubnetGroup.vpcId;
  }

  protected getTargetPort(): number {
    return this.elasticacheMemcachedCluster.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    return this.elasticacheMemcachedCluster.securityGroups;
  }

  protected async attachSecurityGroup(securityGroupId: string): Promise<void> {
    await modifyElasticacheMemcachedCluster({
      identifier: this.elasticacheMemcachedCluster.clusterId,
      securityGroupIds: [
        ...this.elasticacheMemcachedCluster.securityGroups,
        securityGroupId,
      ],
      cachePreviousSecurityGroups: [],
    });
  }
}
