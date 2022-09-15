import { DescribeSubnetsCommand } from '@aws-sdk/client-ec2';
import { ec2Client } from './ec2-client.js';
import { parseSubnetResponse } from './parse-ec2-response.js';
import { AwsSubnet } from './types/aws-vpc.js';

export interface GetSubnetsInput {
  vpcId: string;
}

export interface GetSubnetInput {
  subnetId: string;
}

export async function getSubnets({
  vpcId,
}: GetSubnetsInput): Promise<AwsSubnet[]> {
  const { Subnets } = await ec2Client.send(
    new DescribeSubnetsCommand({
      Filters: [{ Name: 'vpc-id', Values: [vpcId] }],
    })
  );

  if (!Subnets) {
    throw new Error(`Invalid response from AWS.`);
  }

  return Subnets.map(parseSubnetResponse);
}

export async function getSubnet({
  subnetId,
}: GetSubnetInput): Promise<AwsSubnet | undefined> {
  const { Subnets } = await ec2Client.send(
    new DescribeSubnetsCommand({ SubnetIds: [subnetId] })
  );

  if (!Subnets) {
    throw new Error(`Invalid response from AWS.`);
  }

  return Subnets.map(parseSubnetResponse)[0];
}
