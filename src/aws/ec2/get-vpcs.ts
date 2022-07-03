import { DescribeVpcsCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "./ec2-client.js";
import { parseVpcResponse } from "./parse-ec2-response.js";
import { AwsVpc } from "./types.js";

export async function getVpcs(): Promise<AwsVpc[]> {
  const { Vpcs } = await ec2Client.send(new DescribeVpcsCommand({}));

  if (!Vpcs) {
    throw new Error(`Invalid response from AWS.`);
  }

  return Vpcs.map(parseVpcResponse);
}
