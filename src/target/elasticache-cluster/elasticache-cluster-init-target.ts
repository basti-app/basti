import { getCacheClusterSubnetGroup } from '#src/aws/elasticache/get-cache-cluster-subnet-group.js';
import { modifyElasticacheReplicationGroup } from '#src/aws/elasticache/modify-elasticache-replication-group.js';
import type { awsElasticacheCluster } from '#src/aws/elasticache/elasticache-types.js';
import { AwsError } from '#src/aws/common/aws-errors.js';
import {
  getDescribedreplicationGroup,
  getDescribedCacheCluster,
} from '#src/aws/elasticache/get-elasticache-replication-groups.js';

import { InitTargetBase } from '../init-target.js';

import type { CacheCluster } from '@aws-sdk/client-elasticache';

export class ElasticacheClusterInitTarget extends InitTargetBase {
  private readonly elasticacheCluster: awsElasticacheCluster;
  private readonly securityGroups: Promise<string[]>;
  private readonly elasticacheSubnetGroupName: Promise<string | undefined>;
  private readonly detaliedInformationCluster: Promise<CacheCluster>;
  constructor({
    elasticacheCluster,
  }: {
    elasticacheCluster: awsElasticacheCluster;
  }) {
    super();
    this.elasticacheCluster = elasticacheCluster;
    this.detaliedInformationCluster = this.getDescribedCacheCluster();
    this.elasticacheSubnetGroupName = this.getSubnetGroupName();
    this.securityGroups = this.getSecurityGroupIds();
  }

  getId(): string {
    return this.elasticacheCluster.identifier;
  }

  async getVpcId(): Promise<string> {
    const subnetGroupName = await this.elasticacheSubnetGroupName;
    if (subnetGroupName === undefined) {
      throw new Error(`Elasticache subnet group not found`);
    }

    const elasticacheSubnetGroup = await getCacheClusterSubnetGroup({
      name: subnetGroupName,
    });

    if (!elasticacheSubnetGroup) {
      throw new Error(`Cluster subnet group "${subnetGroupName}" not found`);
    }

    return elasticacheSubnetGroup.vpcId;
  }

  protected getTargetPort(): number {
    return this.elasticacheCluster.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    const detailedCache = await this.detaliedInformationCluster;
    const array: string[] = [];
    if (detailedCache.SecurityGroups !== undefined)
      detailedCache.SecurityGroups?.forEach(element => {
        if (element.SecurityGroupId !== undefined)
          array.push(element.SecurityGroupId);
      });
    return array;
  }

  protected async getDescribedCacheCluster(): Promise<CacheCluster> {
    const cluster = await getDescribedreplicationGroup(
      this.elasticacheCluster.identifier
    );
    if (
      cluster.NodeGroups === undefined ||
      cluster.NodeGroups[0] === undefined ||
      cluster.NodeGroups[0].NodeGroupMembers === undefined ||
      cluster.NodeGroups[0].NodeGroupMembers[0] === undefined ||
      cluster.NodeGroups[0].NodeGroupMembers[0].CacheClusterId === undefined
    ) {
      throw new AwsError(
        `replication group id ${this.elasticacheCluster.identifier} not found`
      );
    }
    const cacheId = cluster.NodeGroups[0].NodeGroupMembers[0].CacheClusterId;
    const node = await getDescribedCacheCluster(cacheId);
    if (node.length !== 1 || node[0] === undefined) {
      throw new AwsError(
        `replication group id ${this.elasticacheCluster.identifier} not found`
      );
    }
    return node[0];
  }

  protected async getSubnetGroupName(): Promise<string | undefined> {
    const detailedCache = await this.detaliedInformationCluster;
    return detailedCache.CacheSubnetGroupName;
  }

  protected async attachSecurityGroup(securityGroupId: string): Promise<void> {
    const securityGroups = await this.securityGroups;
    const detailedCache = await this.detaliedInformationCluster;
    await (this.elasticacheCluster.ClusterMode === 'enabled'
      ? modifyElasticacheReplicationGroup({
          identifier: this.elasticacheCluster.identifier,
          securityGroupIds: [...securityGroups, securityGroupId],
          cachePreviousSecurityGroups: [],
        })
      : modifyElasticacheReplicationGroup({
          identifier: detailedCache.ReplicationGroupId,
          securityGroupIds: [...securityGroups, securityGroupId],
          cachePreviousSecurityGroups: [],
        }));
  }
}
