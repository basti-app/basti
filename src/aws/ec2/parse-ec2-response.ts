import {
  Instance,
  RouteTable,
  SecurityGroup,
  Subnet,
  Vpc,
} from "@aws-sdk/client-ec2";
import { z } from "zod";
import { AwsTagParser, transformTags } from "../parse-aws-response.js";
import { AwsEc2Instance } from "./types/aws-ec2-instance.js";
import { AwsSecurityGroup } from "./types/aws-security-group.js";
import { AwsVpc, AwsSubnet, AwsRouteTable } from "./types/aws-vpc.js";

export const parseEc2InstanceResponse: (response: Instance) => AwsEc2Instance =
  z
    .object({
      InstanceId: z.string(),
      Tags: z.array(AwsTagParser).optional(),
      SecurityGroups: z.array(
        z.object({
          GroupId: z.string(),
          GroupName: z.string(),
        })
      ),
    })
    .transform((response) => {
      const tags = transformTags(response.Tags);
      return {
        id: response.InstanceId,
        tags,
        name: tags["Name"],
        securityGroups: response.SecurityGroups.map((group) => ({
          id: group.GroupId,
          name: group.GroupName,
        })),
      };
    }).parse;

export const parseVpcResponse: (response: Vpc) => AwsVpc = z
  .object({
    VpcId: z.string(),
    Tags: z.array(AwsTagParser).optional(),
  })
  .transform((response) => {
    const tags = transformTags(response.Tags);
    return { id: response.VpcId, tags, name: tags["Name"] };
  }).parse;

export const parseSecurityGroupResponse: (
  response: SecurityGroup
) => AwsSecurityGroup = z
  .object({
    GroupId: z.string(),
    GroupName: z.string(),
    Description: z.string(),

    VpcId: z.string(),

    IpPermissions: z.array(
      z.object({
        IpProtocol: z.string(),
        FromPort: z.number().optional(),
        ToPort: z.number().optional(),
        IpRanges: z.array(
          z.object({
            CidrIp: z.string(),
          })
        ),
        UserIdGroupPairs: z.array(
          z.object({
            GroupId: z.string(),
          })
        ),
      })
    ),
  })
  .transform((response) => ({
    id: response.GroupId,
    name: response.GroupName,
    description: response.Description,

    vpcId: response.VpcId,

    ingressRules: response.IpPermissions.map((permission) => ({
      ipProtocol: permission.IpProtocol,
      ports:
        permission.FromPort && permission.ToPort
          ? {
              from: permission.FromPort,
              to: permission.ToPort,
            }
          : undefined,
      sources: [
        ...permission.IpRanges.map((ipRange) => ({
          cidrIp: ipRange.CidrIp,
        })),
        ...permission.UserIdGroupPairs.map((group) => ({
          securityGroupId: group.GroupId,
        })),
      ],
    })),
  })).parse;

export const parseSubnetResponse: (response: Subnet) => AwsSubnet = z
  .object({
    SubnetId: z.string(),
    Tags: z.array(AwsTagParser).optional(),
  })
  .transform((response) => {
    const tags = transformTags(response.Tags);
    return { id: response.SubnetId, tags, name: tags["Name"] };
  }).parse;

export const parseRouteTableResponse: (response: RouteTable) => AwsRouteTable =
  z
    .object({
      RouteTableId: z.string(),
    })
    .transform((response) => ({ id: response.RouteTableId })).parse;
