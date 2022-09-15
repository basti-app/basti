import {
  ListAttachedRolePoliciesCommand,
  ListRolePoliciesCommand,
  ListRolesCommand,
} from '@aws-sdk/client-iam';
import { iamClient } from './iam-client.js';
import {
  parseRoleAttachedPolicyResponse,
  parseRoleResponse,
} from './parse-iam-response.js';
import { AwsRole, AwsRoleAttachedPolicy } from './types.js';

export interface GetIamRoleInput {
  path: string;
}

export interface GetIamRolePoliciesInput {
  roleName: string;
}

export interface GetIamRoleAttachedPoliciesInput {
  roleName: string;
}

export async function getIamRoles({
  path,
}: GetIamRoleInput): Promise<AwsRole[]> {
  const { Roles } = await iamClient.send(
    new ListRolesCommand({
      PathPrefix: path,
    })
  );

  if (!Roles) {
    throw new Error(`Invalid response from AWS.`);
  }

  return Roles.map(parseRoleResponse);
}

export async function getIamRolePolicies({
  roleName,
}: GetIamRolePoliciesInput): Promise<string[]> {
  const { PolicyNames } = await iamClient.send(
    new ListRolePoliciesCommand({
      RoleName: roleName,
    })
  );

  if (!PolicyNames) {
    throw new Error(`Invalid response from AWS.`);
  }

  return PolicyNames;
}

export async function getIamRoleAttachedPolicies({
  roleName,
}: GetIamRoleAttachedPoliciesInput): Promise<AwsRoleAttachedPolicy[]> {
  const { AttachedPolicies } = await iamClient.send(
    new ListAttachedRolePoliciesCommand({
      RoleName: roleName,
    })
  );

  if (!AttachedPolicies) {
    throw new Error(`Invalid response from AWS.`);
  }

  return AttachedPolicies.map(parseRoleAttachedPolicyResponse);
}
