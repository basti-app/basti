import { DescribeSecurityGroupsCommand } from '@aws-sdk/client-ec2';

import { modifyElasticacheServerlessCache } from '#src/aws/elasticache/modify-elasticache-clusters.js';
import type { AwsElasticacheServerlessCache } from '#src/aws/elasticache/elasticache-types.js';
import { ec2Client } from '#src/aws/ec2/ec2-client.js';

import { InitTargetBase } from '../init-target.js';

export class ElasticacheRedisServerlessInitTarget extends InitTargetBase {
  private readonly elasticacheRedisServerlessCache: AwsElasticacheServerlessCache;

  constructor({
    elasticacheRedisServerlessCache,
  }: {
    elasticacheRedisServerlessCache: AwsElasticacheServerlessCache;
  }) {
    super();
    this.elasticacheRedisServerlessCache = elasticacheRedisServerlessCache;
  }

  getId(): string {
    return this.elasticacheRedisServerlessCache.identifier;
  }

  async getVpcId(): Promise<string> {
    if (this.elasticacheRedisServerlessCache.securityGroups[0] === undefined) {
      throw new Error(
        `Cluster subnet group "${this.elasticacheRedisServerlessCache
          .subnetGroupName[0]!}" not found`
      );
    }
    const securityGroupDescription = await ec2Client.send(
      new DescribeSecurityGroupsCommand({
        GroupIds: [this.elasticacheRedisServerlessCache.securityGroups[0]],
      })
    );
    if (
      securityGroupDescription.SecurityGroups === undefined ||
      securityGroupDescription.SecurityGroups[0] === undefined ||
      securityGroupDescription.SecurityGroups[0].VpcId === undefined
    ) {
      throw new Error(
        `Error retrieving VPC ID for cluster subnet group "${this
          .elasticacheRedisServerlessCache.subnetGroupName[0]!}`
      );
    }
    return securityGroupDescription.SecurityGroups[0].VpcId;
  }

  protected getTargetPort(): number {
    return this.elasticacheRedisServerlessCache.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    return this.elasticacheRedisServerlessCache.securityGroups;
  }

  protected async attachSecurityGroup(securityGroupId: string): Promise<void> {
    const securityGroups = this.elasticacheRedisServerlessCache.securityGroups;
    await modifyElasticacheServerlessCache({
      identifier: this.elasticacheRedisServerlessCache.identifier,
      securityGroupIds: [...securityGroups, securityGroupId],
    });
  }
}
