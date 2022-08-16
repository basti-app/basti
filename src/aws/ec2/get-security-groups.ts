import { DescribeSecurityGroupsCommand, Filter } from "@aws-sdk/client-ec2";
import { getTagFilter } from "../tags/get-tag-filter.js";
import { AwsTag } from "../tags/types.js";
import { ec2Client } from "./ec2-client.js";
import { handleEc2Errors } from "./handle-ec2-errors.js";
import { parseSecurityGroupResponse } from "./parse-ec2-response.js";
import { AwsSecurityGroup } from "./types/aws-security-group.js";

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
  const { SecurityGroups } = await handleEc2Errors(() =>
    ec2Client.send(
      new DescribeSecurityGroupsCommand({
        GroupIds: securityGroupIds,
        Filters: [
          ...(tags ? tags.map(getTagFilter) : []),
          ...(names ? [getNamesFilter(names)] : []),
        ],
      })
    )
  );

  if (!SecurityGroups) {
    throw new Error(`Invalid response from AWS.`);
  }

  return SecurityGroups.map(parseSecurityGroupResponse);
}

function getNamesFilter(names: string[]): Filter {
  return {
    Name: "group-name",
    Values: names,
  };
}
