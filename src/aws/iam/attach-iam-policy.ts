import { AttachRolePolicyCommand } from '@aws-sdk/client-iam';

import { iamClient } from './iam-client.js';

export interface AttachIamPolicyInput {
  roleName: string;
  policyArn: string;
}

export async function attachIamPolicy({
  roleName,
  policyArn,
}: AttachIamPolicyInput): Promise<void> {
  await iamClient.send(
    new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: policyArn,
    })
  );
}
