import {
  AuthorizeSecurityGroupIngressCommand,
  CreateSecurityGroupCommand,
  IpPermission,
  waitUntilSecurityGroupExists,
} from "@aws-sdk/client-ec2";
import { COMMON_WAITER_CONFIG } from "../common/waiter-config.js";
import { ec2Client } from "./ec2-client.js";
import { AwsSecurityGroup } from "./types.js";

export type SecurityGroupIngressSource =
  | {
      cidrIp: string;
    }
  | {
      securityGroupId: string;
    };

export interface SecurityGroupIngressPortRange {
  from: number;
  to: number;
}

export interface SecurityGroupIngressRule {
  source: SecurityGroupIngressSource;
  ports: SecurityGroupIngressPortRange;
}

export interface CreateSecurityGroupInput {
  name: string;
  description: string;
  vpcId: string;
  ingressRules?: SecurityGroupIngressRule[];
}

export async function createSecurityGroup({
  name,
  description,
  vpcId,
  ingressRules = [],
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

  await waitUntilSecurityGroupExists(
    { ...COMMON_WAITER_CONFIG, client: ec2Client },
    { GroupIds: [GroupId] }
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
  };
}

function toIpPermission(rule: SecurityGroupIngressRule): IpPermission {
  const source =
    "cidrIp" in rule.source
      ? {
          IpRanges: [{ CidrIp: rule.source.cidrIp }],
        }
      : {
          UserIdGroupPairs: [{ GroupId: rule.source.securityGroupId }],
        };
  return {
    FromPort: rule.ports.from,
    ToPort: rule.ports.to,
    IpProtocol: "tcp",
    ...source,
  };
}
