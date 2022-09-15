import { AttachedPolicy, InstanceProfile, Role } from '@aws-sdk/client-iam';
import { z } from 'zod';
import {
  AwsIamInstanceProfile,
  AwsRole,
  AwsRoleAttachedPolicy,
} from './types.js';

const RoleParser = z
  .object({
    RoleName: z.string(),
  })
  .transform(response => ({ name: response.RoleName }));

export const parseRoleResponse: (response: Role) => AwsRole = RoleParser.parse;

export const parseRoleAttachedPolicyResponse: (
  response: AttachedPolicy
) => AwsRoleAttachedPolicy = z
  .object({
    PolicyName: z.string(),
    PolicyArn: z.string(),
  })
  .transform(response => ({
    name: response.PolicyName,
    arn: response.PolicyArn,
  })).parse;

export const parseIamInstanceProfileResponse: (
  response: InstanceProfile
) => AwsIamInstanceProfile = z
  .object({
    InstanceProfileName: z.string(),
    Arn: z.string(),
    Roles: z.array(RoleParser),
  })
  .transform(response => ({
    name: response.InstanceProfileName,
    arn: response.Arn,
    roles: response.Roles,
  })).parse;
