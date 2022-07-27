import { DescribeInstancesCommand, Filter } from "@aws-sdk/client-ec2";
import { AwsTag } from "../types.js";
import { ec2Client } from "./ec2-client.js";
import { parseEc2InstanceResponse } from "./parse-ec2-response.js";
import { AwsEc2Instance } from "./types/aws-ec2-instance.js";

export interface GetEc2InstancesInput {
  vpcId?: string;
  tags?: AwsTag[];
}

export async function getEc2Instances({
  vpcId,
  tags,
}: GetEc2InstancesInput): Promise<AwsEc2Instance[]> {
  const filters: Filter[] = [
    ...(vpcId ? [getVpcIdFilter(vpcId)] : []),
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

function getTagFilter(tag: AwsTag): Filter {
  return {
    Name: `tag:${tag.key}`,
    Values: [tag.value],
  };
}
