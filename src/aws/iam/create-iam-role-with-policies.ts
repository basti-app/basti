import {
  CreateRoleCommand,
  AttachRolePolicyCommand,
} from "@aws-sdk/client-iam";
import { createIamRole, CreateIamRoleInput } from "./create-iam-role.js";
import { iamClient } from "./iam-client.js";
import { AwsRole } from "./types.js";

export interface CreateIamRoleWithPoliciesInput extends CreateIamRoleInput {
  managedPolicies: string[];
}

export async function createIamRoleWithPolicies(
  input: CreateIamRoleWithPoliciesInput
): Promise<AwsRole> {
  const { managedPolicies } = input;

  const role = await createIamRole(input);

  await Promise.all([
    managedPolicies.map((policyName) =>
      iamClient.send(
        new AttachRolePolicyCommand({
          RoleName: role.name,
          PolicyArn: formatManagedPolicyArn(policyName),
        })
      )
    ),
  ]);

  return role;
}

function formatManagedPolicyArn(name: string): string {
  return `arn:aws:iam::aws:policy/${name}`;
}
