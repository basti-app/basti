import {
  AuthorizeSecurityGroupIngressCommand,
  CreateSecurityGroupCommand,
  IpPermission,
  waitUntilSecurityGroupExists,
} from "@aws-sdk/client-ec2";
import { COMMON_WAITER_CONFIG } from "../common/waiter-config.js";
import { handleWaiterError } from "../common/waiter-error.js";
import { ec2Client } from "./ec2-client.js";
import {
  AwsSecurityGroup,
  SecurityGroupIngressRule,
} from "./types/aws-security-group.js";

export type CreateSecurityGroupInput = Omit<AwsSecurityGroup, "id">;

export async function createSecurityGroup({
  name,
  description,
  vpcId,
  ingressRules,
}: CreateSecurityGroupInput): Promise<AwsSecurityGroup> {
  const { GroupId } = await ec2Client.send(
    new CreateSecurityGroupCommand({
      GroupName: name,
      Description: description,
      VpcId: vpcId,
    })
  );

  if (!GroupId) {
    throw new Error(`Invalid response from AWS.`);
  }

  await handleWaiterError(() =>
    waitUntilSecurityGroupExists(
      { ...COMMON_WAITER_CONFIG, client: ec2Client.client },
      { GroupIds: [GroupId] }
    )
  );

  if (ingressRules.length > 0) {
    await ec2Client.send(
      new AuthorizeSecurityGroupIngressCommand({
        GroupId,
        IpPermissions: ingressRules.map(toIpPermission),
      })
    );
  }

  return {
    id: GroupId,
    name,
    description,
    vpcId,
    ingressRules,
  };
}

function toIpPermission(rule: SecurityGroupIngressRule): IpPermission {
  const sources = rule.sources.reduce<
    Required<Pick<IpPermission, "IpRanges" | "UserIdGroupPairs">>
  >(
    (acc, source) => {
      "cidrIp" in source
        ? acc.IpRanges.push({ CidrIp: source.cidrIp })
        : acc.UserIdGroupPairs.push({ GroupId: source.securityGroupId });
      return acc;
    },
    {
      IpRanges: [],
      UserIdGroupPairs: [],
    }
  );

  return {
    FromPort: rule?.ports?.from,
    ToPort: rule?.ports?.to,

    IpProtocol: rule.ipProtocol,
    ...sources,
  };
}
