import { PutRolePolicyCommand } from '@aws-sdk/client-iam';

import { iamClient } from './iam-client.js';

export interface CreateIamInlinePolicyInput {
  roleName: string;
  policyName: string;
  policyDocument: string;
}

export async function createIamInlinePolicy({
  roleName,
  policyName,
  policyDocument,
}: CreateIamInlinePolicyInput): Promise<void> {
  await iamClient.send(
    new PutRolePolicyCommand({
      RoleName: roleName,
      PolicyName: policyName,
      PolicyDocument: policyDocument,
    })
  );
}
