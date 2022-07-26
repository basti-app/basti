import { DescribeSecurityGroupsCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "./ec2-client.js";
import { parseSecurityGroupResponse } from "./parse-ec2-response.js";
import { AwsSecurityGroup } from "./types/aws-security-group.js";

export interface GetSecurityGroupsInput {
  securityGroupIds: string[];
}

export async function getSecurityGroups({
  securityGroupIds,
}: GetSecurityGroupsInput): Promise<AwsSecurityGroup[]> {
  const { SecurityGroups } = await ec2Client.send(
    new DescribeSecurityGroupsCommand({ GroupIds: securityGroupIds })
  );

  if (!SecurityGroups) {
    throw new Error(`Invalid response from AWS.`);
  }

  return SecurityGroups.map(parseSecurityGroupResponse);
}
