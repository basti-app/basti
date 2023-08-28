import { DescribeInstancesCommand } from '@aws-sdk/client-ec2';

import { getTagFilter } from '../tags/get-tag-filter.js';

import { ec2Client } from './ec2-client.js';
import { parseEc2InstanceResponse } from './parse-ec2-response.js';

import type { AwsTag } from '../tags/types.js';
import type { Filter, InstanceStateName } from '@aws-sdk/client-ec2';
import type { AwsEc2Instance } from './types/aws-ec2-instance.js';

export interface GetEc2InstancesInput {
  vpcId?: string;
  states?: InstanceStateName[];
  tags?: AwsTag[];
}

export async function getEc2Instances({
  vpcId,
  states,
  tags,
}: GetEc2InstancesInput): Promise<AwsEc2Instance[]> {
  const filters: Filter[] = [
    ...(vpcId !== undefined ? [getVpcIdFilter(vpcId)] : []),
    ...(states !== undefined ? [getStateFilter(states)] : []),
    ...(tags !== undefined ? tags.map(tag => getTagFilter(tag)) : []),
  ];

  const { Reservations } = await ec2Client.send(
    new DescribeInstancesCommand({
      Filters: filters.length > 0 ? filters : undefined,
    })
  );

  if (!Reservations) {
    throw new Error(`Invalid response from AWS.`);
  }

  return Reservations.flatMap(reservation => reservation.Instances ?? []).map(
    instance => parseEc2InstanceResponse(instance)
  );
}

function getVpcIdFilter(vpcId: string): Filter {
  return { Name: 'vpc-id', Values: [vpcId] };
}

function getStateFilter(states: InstanceStateName[]): Filter {
  return { Name: 'instance-state-name', Values: states };
}
