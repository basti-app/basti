import { getCacheClusterSubnetGroup } from '#src/aws/elasticache/get-cache-cluster-subnet-group.js';
import { modifyElasticacheReplicationGroup } from '#src/aws/elasticache/modify-elasticache-replication-group.js';
import type { AwsElasticacheGenericObject } from '#src/aws/elasticache/elasticache-types.js';
import { AwsError } from '#src/aws/common/aws-errors.js';
import { getDescribedreplicationGroup } from '#src/aws/elasticache/get-elasticache-replication-groups.js';
import { getDescribedCacheCluster } from '#src/aws/elasticache/get-elasticache-cache-clusters.js';

import { InitTargetBase } from '../init-target.js';

import type { CacheCluster } from '@aws-sdk/client-elasticache';

export class ElasticacheClusterInitTarget extends InitTargetBase {
  private readonly elasticacheRedisCluster: AwsElasticacheGenericObject;
  private readonly securityGroups: Promise<string[]>;
  private readonly elasticacheSubnetGroupName: Promise<string | undefined>;
  private readonly detaliedInformationCluster: Promise<CacheCluster>;
  constructor({
    elasticacheRedisCluster,
  }: {
    elasticacheRedisCluster: AwsElasticacheGenericObject;
  }) {
    super();
    this.elasticacheRedisCluster = elasticacheRedisCluster;
    this.detaliedInformationCluster = this.getDescribedCacheCluster();
    this.elasticacheSubnetGroupName = this.getSubnetGroupName();
    this.securityGroups = this.getSecurityGroupIds();
  }

  getId(): string {
    return this.elasticacheRedisCluster.identifier;
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
    return this.elasticacheRedisCluster.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    const detailedCache = await this.detaliedInformationCluster;
    let array: string[] = [];
    if (detailedCache.SecurityGroups !== undefined)
      array = detailedCache.SecurityGroups.map(element => {
        return element.SecurityGroupId !== undefined
          ? element.SecurityGroupId
          : 'undefined';
      }).filter(str => {
        return str !== 'undefined';
      });
    return array;
  }

  protected async getDescribedCacheCluster(): Promise<CacheCluster> {
    const cluster = await getDescribedreplicationGroup(
      this.elasticacheRedisCluster.identifier
    );
    if (
      cluster.NodeGroups === undefined ||
      cluster.NodeGroups[0] === undefined ||
      cluster.NodeGroups[0].NodeGroupMembers === undefined ||
      cluster.NodeGroups[0].NodeGroupMembers[0] === undefined ||
      cluster.NodeGroups[0].NodeGroupMembers[0].CacheClusterId === undefined
    )
      throw new AwsError('unexpected Elasticache Response');
    const cacheId = cluster.NodeGroups[0].NodeGroupMembers[0].CacheClusterId;
    return await getDescribedCacheCluster(cacheId);
  }

  protected async getSubnetGroupName(): Promise<string | undefined> {
    const detailedCache = await this.detaliedInformationCluster;
    return detailedCache.CacheSubnetGroupName;
  }

  protected async attachSecurityGroup(securityGroupId: string): Promise<void> {
    const securityGroups = await this.securityGroups;
    const detailedCache = await this.detaliedInformationCluster;
    await (this.elasticacheRedisCluster.clusterMode === 'enabled'
      ? modifyElasticacheReplicationGroup({
          identifier: this.elasticacheRedisCluster.identifier,
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
