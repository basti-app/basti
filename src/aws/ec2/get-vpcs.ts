import { DescribeVpcsCommand } from '@aws-sdk/client-ec2';
import { ec2Client } from './ec2-client.js';
import { parseVpcResponse } from './parse-ec2-response.js';
import { AwsVpc } from './types/aws-vpc.js';

export interface GetVpcInput {
  vpcId: string;
}

export async function getVpcs(): Promise<AwsVpc[]> {
  const { Vpcs } = await ec2Client.send(new DescribeVpcsCommand({}));

  if (!Vpcs) {
    throw new Error(`Invalid response from AWS.`);
  }

  return Vpcs.map(parseVpcResponse);
}

export async function getVpc({
  vpcId,
}: GetVpcInput): Promise<AwsVpc | undefined> {
  const { Vpcs } = await ec2Client.send(
    new DescribeVpcsCommand({ VpcIds: [vpcId] })
  );

  if (!Vpcs) {
    throw new Error(`Invalid response from AWS.`);
  }

  return Vpcs[0] && parseVpcResponse(Vpcs[0]);
}
