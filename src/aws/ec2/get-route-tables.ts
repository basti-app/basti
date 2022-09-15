import { DescribeRouteTablesCommand } from '@aws-sdk/client-ec2';
import { ec2Client } from './ec2-client.js';
import { parseRouteTableResponse } from './parse-ec2-response.js';
import { AwsRouteTable } from './types/aws-vpc.js';

export interface GetRoutingTableInput {
  subnetId: string;
}

export async function getRouteTable({
  subnetId,
}: GetRoutingTableInput): Promise<AwsRouteTable> {
  const { RouteTables } = await ec2Client.send(
    new DescribeRouteTablesCommand({
      Filters: [{ Name: 'association.subnet-id', Values: [subnetId] }],
    })
  );

  if (!RouteTables) {
    throw new Error(`Invalid response from AWS.`);
  }

  return RouteTables.map(parseRouteTableResponse)[0];
}
