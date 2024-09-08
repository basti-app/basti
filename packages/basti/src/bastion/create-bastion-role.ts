import { createIamInlinePolicy } from '#src/aws/iam/create-iam-inline-policy.js';
import { createIamRoleCurrentRegion } from '#src/aws/iam/create-iam-role.js';
import type { AwsRole } from '#src/aws/iam/types.js';
import type { AwsTag } from '#src/aws/tags/types.js';

import {
  BASTION_INSTANCE_ROLE_NAME_PREFIX,
  BASTION_INSTANCE_ROLE_PATH_PREFIX,
} from './bastion.js';

export interface CreateBastionRoleInput {
  bastionId: string;
  tags: AwsTag[];
}

export interface CreateBastionInlinePoliciesInput {
  bastionRoleName: string;
  bastionInstanceId: string;
}

export async function createBastionRole({
  bastionId,
  tags,
}: CreateBastionRoleInput): Promise<AwsRole> {
  return await createIamRoleCurrentRegion({
    name: `${BASTION_INSTANCE_ROLE_NAME_PREFIX}-${bastionId}`,
    pathPrefix: BASTION_INSTANCE_ROLE_PATH_PREFIX,
    principalService: 'ec2.amazonaws.com',
    tags,
  });
}

export async function createBastionRoleInlinePolicies({
  bastionRoleName,
  bastionInstanceId,
}: CreateBastionInlinePoliciesInput): Promise<void> {
  await createIamInlinePolicy({
    roleName: bastionRoleName,
    policyName: 'session-manager-access',
    policyDocument: getSessionManagerAccessPolicy(),
  });

  await createIamInlinePolicy({
    roleName: bastionRoleName,
    policyName: 'ec2-instance-access',
    policyDocument: getAwsInstanceAccessPolicy(bastionInstanceId),
  });
}

function getSessionManagerAccessPolicy(): string {
  // Based on https://docs.aws.amazon.com/systems-manager/latest/userguide/getting-started-create-iam-instance-profile.html
  return JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'ssm:UpdateInstanceInformation',
          'ssmmessages:CreateControlChannel',
          'ssmmessages:CreateDataChannel',
          'ssmmessages:OpenControlChannel',
          'ssmmessages:OpenDataChannel',
        ],
        Resource: '*',
      },
    ],
  });
}

function getAwsInstanceAccessPolicy(bastionInstanceId: string): string {
  return JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['ec2:DescribeInstances'],
        Resource: '*', // ec2:DescribeInstances does not support resource-level permissions
      },
      {
        Effect: 'Allow',
        Action: ['ec2:CreateTags'],
        Resource: `arn:aws:ec2:*:*:instance/${bastionInstanceId}`,
      },
    ],
  });
}
