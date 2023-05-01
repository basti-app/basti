import { DescribeSecurityGroupsCommand } from '@aws-sdk/client-ec2';

import { getTagFilter } from '../tags/get-tag-filter.js';

import { ec2Client } from './ec2-client.js';
import { parseSecurityGroupResponse } from './parse-ec2-response.js';

import type { AwsTag } from '../tags/types.js';
import type { Filter } from '@aws-sdk/client-ec2';
import type { AwsSecurityGroup } from './types/aws-security-group.js';

export interface GetSecurityGroupsInput {
  securityGroupIds?: string[];
  tags?: AwsTag[];
  names?: string[];
}

export async function getSecurityGroups({
  securityGroupIds,
  tags,
  names,
}: GetSecurityGroupsInput): Promise<AwsSecurityGroup[]> {
  if (securityGroupIds?.length === 0) {
    return [];
  }

  const filters: Filter[] = [
    ...(tags ? tags.map(tag => getTagFilter(tag)) : []),
    ...(names ? [getNamesFilter(names)] : []),
  ];

  const { SecurityGroups } = await ec2Client.send(
    new DescribeSecurityGroupsCommand({
      GroupIds: securityGroupIds,
      Filters: filters.length > 0 ? filters : undefined,
    })
  );

  if (!SecurityGroups) {
    throw new Error(`Invalid response from AWS.`);
  }

  return SecurityGroups.map(group => parseSecurityGroupResponse(group));
}

function getNamesFilter(names: string[]): Filter {
  return {
    Name: 'group-name',
    Values: names,
  };
}
