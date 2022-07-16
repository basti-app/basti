import {
  AttachRolePolicyCommand,
  CreateRoleCommand,
  waitUntilRoleExists,
} from "@aws-sdk/client-iam";
import { COMMON_WAITER_CONFIG } from "../common/waiter-config.js";
import { iamClient } from "./iam-client.js";
import { parseRoleResponse } from "./parse-iam-response.js";
import { AwsRole } from "./types.js";

export interface CreateIamRoleInput {
  name: string;
  principalService: string;
  managedPolicies: string[];
}

export async function createIamRole({
  name,
  principalService,
  managedPolicies,
}: CreateIamRoleInput): Promise<AwsRole> {
  const { Role } = await iamClient.send(
    new CreateRoleCommand({
      RoleName: name,
      AssumeRolePolicyDocument:
        formatAssumeRolePolicyDocument(principalService),
    })
  );

  if (!Role) {
    throw new Error(`Invalid response from AWS.`);
  }

  const role = parseRoleResponse(Role);

  await waitUntilRoleExists(
    { ...COMMON_WAITER_CONFIG, client: iamClient },
    { RoleName: role.name }
  );

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

function formatAssumeRolePolicyDocument(principalService: string): string {
  return JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Effect: "Allow",
        Sid: "",
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
