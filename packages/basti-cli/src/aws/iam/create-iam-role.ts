import { CreateRoleCommand, waitUntilRoleExists } from '@aws-sdk/client-iam';

import { COMMON_WAITER_CONFIG } from '../common/waiter-config.js';
import { handleWaiterError } from '../common/waiter-error.js';

import { createIamInlinePolicy } from './create-iam-inline-policy.js';
import { attachIamPolicy } from './attach-iam-policy.js';
import { iamClient } from './iam-client.js';
import { parseRoleResponse } from './parse-iam-response.js';

import type { AwsRole } from './types.js';

export interface InlinePolicyInput {
  name: string;
  document: string;
}

export interface CreateIamRoleInput {
  name: string;
  path: string;
  principalService: string;
  managedPolicies?: string[];
  inlinePolicies?: InlinePolicyInput[];
}

export async function createIamRole({
  name,
  path,
  principalService,
  managedPolicies,
  inlinePolicies,
}: CreateIamRoleInput): Promise<AwsRole> {
  const { Role } = await iamClient.send(
    new CreateRoleCommand({
      RoleName: name,
      Path: path,
      AssumeRolePolicyDocument:
        formatAssumeRolePolicyDocument(principalService),
    })
  );

  if (!Role) {
    throw new Error(`Invalid response from AWS.`);
  }

  const role = parseRoleResponse(Role);

  await handleWaiterError(
    async () =>
      await waitUntilRoleExists(
        { ...COMMON_WAITER_CONFIG, client: iamClient.client },
        { RoleName: role.name }
      )
  );

  if (managedPolicies) {
    await Promise.all(
      managedPolicies.map(
        async policy =>
          await attachIamPolicy({
            roleName: role.name,
            policyArn: formatManagedPolicyArn(policy),
          })
      )
    );
  }

  if (inlinePolicies) {
    await Promise.all(
      inlinePolicies.map(
        async policy =>
          await createIamInlinePolicy({
            roleName: role.name,
            policyName: policy.name,
            policyDocument: policy.document,
          })
      )
    );
  }

  return role;
}

function formatAssumeRolePolicyDocument(principalService: string): string {
  return JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Sid: '',
        Principal: {
          Service: principalService,
        },
      },
    ],
  });
}

function formatManagedPolicyArn(name: string): string {
  return `arn:aws:iam::aws:policy/${name}`;
}
