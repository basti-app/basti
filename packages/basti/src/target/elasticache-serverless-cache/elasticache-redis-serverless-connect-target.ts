import { DescribeSecurityGroupsCommand } from '@aws-sdk/client-ec2';

import type { AwsElasticacheServerlessCache } from '#src/aws/elasticache/elasticache-types.js';
import { ec2Client } from '#src/aws/ec2/ec2-client.js';

import { ConnectTargetBase } from '../connect-target.js';

import type { ConnectTargetBaseConstructorInput } from '../connect-target.js';

export class ElasticacheRedisServerlessConnectTarget extends ConnectTargetBase {
  private readonly elasticacheRedisServerlessCache: AwsElasticacheServerlessCache;
  constructor(
    input: ConnectTargetBaseConstructorInput & {
      elasticacheRedisServerlessCache: AwsElasticacheServerlessCache;
    }
  ) {
    super(input);
    this.elasticacheRedisServerlessCache =
      input.elasticacheRedisServerlessCache;
  }

  async getHost(): Promise<string> {
    return this.elasticacheRedisServerlessCache.host;
  }

  async getPort(): Promise<number> {
    return this.elasticacheRedisServerlessCache.port;
  }

  protected async getSecurityGroupIds(): Promise<string[]> {
    return this.elasticacheRedisServerlessCache.securityGroups;
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
}
