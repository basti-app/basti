import {
  DescribeCacheClustersCommand,
  DescribeReplicationGroupsCommand,
} from '@aws-sdk/client-elasticache';

import type { awsElasticacheCluster } from '#src/aws/elasticache/elasticache-types.js';
import { getCacheClusterSubnetGroup } from '#src/aws/elasticache/get-cache-cluster-subnet-group.js';
import { elasticacheClient } from '#src/aws/elasticache/elasticache-client.js';
import { AwsNotFoundError, AwsError } from '#src/aws/common/aws-errors.js';

import { ConnectTargetBase } from '../connect-target.js';

import type { DescribeCacheClustersCommandOutput } from '@aws-sdk/client-elasticache';
import type { ConnectTargetBaseConstructorInput } from '../connect-target.js';

export class ElasticacheClusterConnectTarget extends ConnectTargetBase {
  private readonly elasticacheCluster: awsElasticacheCluster;
  private readonly elasticacheSubnetGroupName: Promise<string | undefined>;
  private readonly detaliedInformationCluster: Promise<DescribeCacheClustersCommandOutput>;
  constructor(
    input: ConnectTargetBaseConstructorInput & {
      elasticacheCluster: awsElasticacheCluster;
    }
  ) {
    super(input);
    this.elasticacheCluster = input.elasticacheCluster;
    this.detaliedInformationCluster = this.getDescribedCacheCluster();
    this.elasticacheSubnetGroupName = this.getSubnetGroupName();
    this.elasticacheCluster = input.elasticacheCluster;
  }

  async getHost(): Promise<string> {
    return this.elasticacheCluster.host;
  }

  async getPort(): Promise<number> {
    return this.elasticacheCluster.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    const detailedCache = await this.detaliedInformationCluster;

    if (detailedCache.CacheClusters === undefined) {
      throw AwsNotFoundError;
    }
    const array: string[] = [];
    if (detailedCache.CacheClusters[0]?.SecurityGroups !== undefined)
      detailedCache.CacheClusters[0]?.SecurityGroups?.forEach(element => {
        if (element.SecurityGroupId !== undefined)
          array.push(element.SecurityGroupId);
      });
    return array;
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

  protected async getDescribedCacheCluster(): Promise<DescribeCacheClustersCommandOutput> {
    const cluster = await elasticacheClient.send(
      new DescribeReplicationGroupsCommand({
        ReplicationGroupId: this.elasticacheCluster.replicationGroupId,
      })
    );
    const cacheId =
      cluster.ReplicationGroups![0]?.NodeGroups![0]?.NodeGroupMembers![0]
        ?.CacheClusterId;
    const node = await elasticacheClient.send(
      new DescribeCacheClustersCommand({ CacheClusterId: cacheId })
    );
    if (node.CacheClusters?.length === 0) {
      throw AwsNotFoundError;
    }
    return node;
  }

  protected async getSubnetGroupName(): Promise<string | undefined> {
    const detailedCache = await this.detaliedInformationCluster;
    return detailedCache.CacheClusters![0]?.CacheSubnetGroupName;
  }
}
