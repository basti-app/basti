import {
  DeleteRoleCommand,
  DeleteRolePolicyCommand,
  DetachRolePolicyCommand,
} from '@aws-sdk/client-iam';

import {
  getIamRoleAttachedPolicies,
  getIamRolePolicies,
} from './get-iam-role.js';
import { iamClient } from './iam-client.js';

export interface DeleteIamRoleInput {
  roleName: string;
}

export async function deleteIamRole({
  roleName,
}: DeleteIamRoleInput): Promise<void> {
  const policyNames = await getIamRolePolicies({ roleName });

  await Promise.all(
    policyNames.map(
      async policyName =>
        await iamClient.send(
          new DeleteRolePolicyCommand({
            RoleName: roleName,
            PolicyName: policyName,
          })
        )
    )
  );

  const attachedPolicies = await getIamRoleAttachedPolicies({ roleName });

  await Promise.all(
    attachedPolicies.map(
      async policy =>
        await iamClient.send(
          new DetachRolePolicyCommand({
            RoleName: roleName,
            PolicyArn: policy.arn,
          })
        )
    )
  );

  await iamClient.send(
    new DeleteRoleCommand({
      RoleName: roleName,
    })
  );
}
