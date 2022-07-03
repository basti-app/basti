import { CreateRoleCommand } from "@aws-sdk/client-iam";
import { iamClient } from "./iam-client.js";
import { AwsRole } from "./types.js";

export interface CreateIamRoleInput {
  name: string;
  principalService: string;
}

export async function createIamRole({
  name,
  principalService,
}: CreateIamRoleInput): Promise<AwsRole> {
  const { Role } = await iamClient.send(
    new CreateRoleCommand({
      RoleName: name,
      AssumeRolePolicyDocument:
        formatAssumeRolePolicyDocument(principalService),
    })
  );

  if (!Role || !Role.RoleName) {
    throw new Error(`Invalid response from AWS.`);
  }

  return {
    name: Role.RoleName,
  };
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
