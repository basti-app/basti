import { DescribeSecurityGroupsCommand } from '@aws-sdk/client-ec2';
import {
  ModifyReplicationGroupCommand,
  ModifyCacheClusterCommand,
  ModifyServerlessCacheCommand,
} from '@aws-sdk/client-elasticache';

import { ec2Client } from '../ec2/ec2-client.js';
import { AwsError } from '../common/aws-errors.js';

import { elasticacheClient } from './elasticache-client.js';

import type { SecurityGroupMembership } from '@aws-sdk/client-elasticache';
import type { DescribeSecurityGroupsCommandInput } from '@aws-sdk/client-ec2';

export interface ModifyElasticacheInput {
  identifier: string | undefined;
  securityGroupIds: string[];
  cachePreviousSecurityGroups: SecurityGroupMembership[];
}
export interface ModifyServerlessInput {
  identifier: string | undefined;
  securityGroupIds: string[];
}

export async function modifyElasticacheReplicationGroup({
  identifier,
  securityGroupIds,
  cachePreviousSecurityGroups,
}: ModifyElasticacheInput): Promise<void> {
  if (securityGroupIds.length === 0) {
    const defaultSecurityGroup = getDefaultVpcIdFromSecurityGroup(
      cachePreviousSecurityGroups[0]?.SecurityGroupId
    );
    const resolved = await defaultSecurityGroup;
    if (resolved !== undefined) {
      securityGroupIds.push(resolved);
    }
  }
  await elasticacheClient.send(
    new ModifyReplicationGroupCommand({
      ReplicationGroupId: identifier,
      SecurityGroupIds: securityGroupIds,
      ApplyImmediately: true,
    })
  );
}

export async function modifyElasticacheServerlessCache({
  identifier,
  securityGroupIds,
}: ModifyServerlessInput): Promise<void> {
  await elasticacheClient.send(
    new ModifyServerlessCacheCommand({
      ServerlessCacheName: identifier,
      SecurityGroupIds: securityGroupIds,
    })
  );
}

// Because of a bug in the elasticache API when a cluster is created with no specified security groups ,
// it appears it has none when in reality it's assigned the default vpc's security group.
// this is a workaround for the case in which the basti security groups is the only one in the cluster's.
// The elasticache team has been alerted about the bug.
async function getDefaultVpcIdFromSecurityGroup(
  SecurityGroupId: string | undefined
): Promise<string | undefined> {
  if (SecurityGroupId === undefined)
    throw new AwsError('Security group not found');
  let params: DescribeSecurityGroupsCommandInput = {
    GroupIds: [SecurityGroupId],
  };
  const securityGroupDescription = await ec2Client.send(
    new DescribeSecurityGroupsCommand(params)
  );

  const vpcId = securityGroupDescription.SecurityGroups![0]?.VpcId;
  if (vpcId !== undefined) {
    params = {
      Filters: [
        { Name: 'vpc-id', Values: [vpcId] },
        { Name: 'group-name', Values: ['default'] },
      ],
    };
    const defaultSecurityGroup = await ec2Client.send(
      new DescribeSecurityGroupsCommand(params)
    );
    return defaultSecurityGroup.SecurityGroups![0]!.GroupId;
  }
}

export async function modifyElasticacheMemcachedCluster({
  identifier,
  securityGroupIds,
  cachePreviousSecurityGroups,
}: ModifyElasticacheInput): Promise<void> {
  if (securityGroupIds.length === 0) {
    const defaultSecurityGroup = getDefaultVpcIdFromSecurityGroup(
      cachePreviousSecurityGroups[0]?.SecurityGroupId
    );
    const resolved = await defaultSecurityGroup;
    if (resolved !== undefined) {
      securityGroupIds.push(resolved);
    }
  }
  await elasticacheClient.send(
    new ModifyCacheClusterCommand({
      CacheClusterId: identifier,
      SecurityGroupIds: securityGroupIds,
      ApplyImmediately: true,
    })
  );
}
