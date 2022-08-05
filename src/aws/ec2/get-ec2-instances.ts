import {
  DescribeInstancesCommand,
  Filter,
  InstanceStateName,
} from "@aws-sdk/client-ec2";
import { getTagFilter } from "../tags/get-tag-filter.js";
import { AwsTag } from "../tags/types.js";
import { ec2Client } from "./ec2-client.js";
import { parseEc2InstanceResponse } from "./parse-ec2-response.js";
import { AwsEc2Instance } from "./types/aws-ec2-instance.js";

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
    ...(vpcId ? [getVpcIdFilter(vpcId)] : []),
    ...(states ? [getStateFilter(states)] : []),
    ...(tags ? tags.map(getTagFilter) : []),
  ];
  const { Reservations } = await ec2Client.send(
    new DescribeInstancesCommand({
      Filters: filters,
    })
  );

  if (!Reservations) {
    throw new Error(`Invalid response from AWS.`);
  }

  return Reservations.flatMap((reservation) => reservation.Instances || []).map(
    parseEc2InstanceResponse
  );
}

function getVpcIdFilter(vpcId: string): Filter {
  return { Name: "vpc-id", Values: [vpcId] };
}

function getStateFilter(states: InstanceStateName[]): Filter {
  return { Name: "instance-state-name", Values: states };
}
