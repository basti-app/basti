import type { AwsElasticacheGenericObject } from '#src/aws/elasticache/elasticache-types.js';
import { getCacheClusterSubnetGroup } from '#src/aws/elasticache/get-cache-cluster-subnet-group.js';
import { getDescribedCacheCluster } from '#src/aws/elasticache/get-elasticache-cache-clusters.js';
import { getDescribedreplicationGroup } from '#src/aws/elasticache/get-elasticache-replication-groups.js';
import { AwsError } from '#src/aws/common/aws-errors.js';

import { ConnectTargetBase } from '../connect-target.js';

import type { CacheCluster } from '@aws-sdk/client-elasticache';
import type { ConnectTargetBaseConstructorInput } from '../connect-target.js';

export class ElasticacheClusterConnectTarget extends ConnectTargetBase {
  private readonly elasticacheCluster: AwsElasticacheGenericObject;
  private readonly elasticacheSubnetGroupName: Promise<string | undefined>;
  private readonly detaliedInformationCluster: Promise<CacheCluster>;
  constructor(
    input: ConnectTargetBaseConstructorInput & {
      elasticacheCluster: AwsElasticacheGenericObject;
    }
  ) {
    super(input);
    this.elasticacheCluster = input.elasticacheCluster;
    this.detaliedInformationCluster = this.getDescribedCacheCluster();
    this.elasticacheSubnetGroupName = this.getSubnetGroupName();
  }

  async getHost(): Promise<string> {
    return this.elasticacheCluster.host;
  }

  async getPort(): Promise<number> {
    return this.elasticacheCluster.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    const detailedCache = await this.detaliedInformationCluster;
    const array: string[] = [];
    if (detailedCache.SecurityGroups === undefined) {
      return array;
    }
    const unfiltered = detailedCache.SecurityGroups.map(element => {
      return element.SecurityGroupId !== undefined
        ? element.SecurityGroupId
        : '';
    });
    return unfiltered.filter(Element => {
      return Element !== '';
    });
  }

  async getVpcId(): Promise<string> {
    const awsSubnetGroup = await this.elasticacheSubnetGroupName;
    if (awsSubnetGroup === undefined) {
      throw AwsError;
    }

    const dbSubnetGroup = await getCacheClusterSubnetGroup({
      name: awsSubnetGroup,
    });

    if (!dbSubnetGroup) {
      throw new Error(`Cluster subnet group "${awsSubnetGroup}" not found`);
    }

    return dbSubnetGroup.vpcId;
  }

  protected getTargetPort(): number {
    return this.elasticacheCluster.port;
  }

  protected async getDescribedCacheCluster(): Promise<CacheCluster> {
    const cluster = await getDescribedreplicationGroup(
      this.elasticacheCluster.replicationGroupId
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
}
