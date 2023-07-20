import {
  AuthorizeSecurityGroupIngressCommand,
  CreateSecurityGroupCommand,
  waitUntilSecurityGroupExists,
} from '@aws-sdk/client-ec2';

import { COMMON_WAITER_CONFIG } from '../common/waiter-config.js';
import { handleWaiterError } from '../common/waiter-error.js';
import { toTagSpecification } from '../tags/utils/to-tag-specification.js';

import { ec2Client } from './ec2-client.js';

import type { AwsTag } from '../tags/types.js';
import type { IpPermission } from '@aws-sdk/client-ec2';
import type {
  AwsSecurityGroup,
  SecurityGroupIngressRule,
} from './types/aws-security-group.js';

export interface CreateSecurityGroupInput {
  name: string;
  description: string;
  vpcId: string;
  ingressRules: SecurityGroupIngressRule[];
  tags: AwsTag[];
}

export async function createSecurityGroup({
  name,
  description,
  vpcId,
  ingressRules,
  tags,
}: CreateSecurityGroupInput): Promise<AwsSecurityGroup> {
  const { GroupId } = await ec2Client.send(
    new CreateSecurityGroupCommand({
      GroupName: name,
      Description: description,
      VpcId: vpcId,
      // TODO: Add tags to the egress rule
      TagSpecifications: [toTagSpecification('security-group', tags)],
    })
  );

  if (GroupId === undefined) {
    throw new Error(`Invalid response from AWS.`);
  }

  await handleWaiterError(
    async () =>
      await waitUntilSecurityGroupExists(
        { ...COMMON_WAITER_CONFIG, client: ec2Client.client },
        { GroupIds: [GroupId] }
      )
  );

  if (ingressRules.length > 0) {
    await ec2Client.send(
      new AuthorizeSecurityGroupIngressCommand({
        GroupId,
        IpPermissions: ingressRules.map(rule => toIpPermission(rule)),
        TagSpecifications: [toTagSpecification('security-group-rule', tags)],
      })
    );
  }

  return {
    id: GroupId,
    name,
    description,
    vpcId,
    ingressRules,
  };
}

function toIpPermission(rule: SecurityGroupIngressRule): IpPermission {
  const IpRanges = rule.sources
    // eslint-disable-next-line unicorn/no-array-callback-reference -- breaks type guard
    .filter(isIpRangeSource)
    .map(source => ({ CidrIp: source.cidrIp }));
  const UserIdGroupPairs = rule.sources
    // eslint-disable-next-line unicorn/no-array-callback-reference -- breaks type guard
    .filter(isSecurityGroupSource)
    .map(source => ({ GroupId: source.securityGroupId }));

  const sources = {
    IpRanges: IpRanges.length > 0 ? IpRanges : undefined,
    UserIdGroupPairs:
      UserIdGroupPairs.length > 0 ? UserIdGroupPairs : undefined,
  };

  return {
    FromPort: rule.ports?.from,
    ToPort: rule.ports?.to,

    IpProtocol: rule.ipProtocol,
    ...sources,
  };
}

function isIpRangeSource(
  source: SecurityGroupIngressRule['sources'][number]
): source is { cidrIp: string } {
  return 'cidrIp' in source;
}

function isSecurityGroupSource(
  source: SecurityGroupIngressRule['sources'][number]
): source is { securityGroupId: string } {
  return 'securityGroupId' in source;
}
