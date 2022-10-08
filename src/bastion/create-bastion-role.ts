import { createIamInlinePolicy } from '~/aws/iam/create-iam-inline-policy.js';
import { createIamRole } from '~/aws/iam/create-iam-role.js';
import { AwsRole } from '~/aws/iam/types.js';

import {
  BASTION_INSTANCE_ROLE_NAME_PREFIX,
  BASTION_INSTANCE_ROLE_PATH,
} from './bastion.js';

export interface CreateBastionRoleInput {
  bastionId: string;
}

export interface CreateBastionInlinePoliciesInput {
  bastionInstanceId: string;
  bastionRoleName: string;
}

export async function createBastionRole({
  bastionId,
}: CreateBastionRoleInput): Promise<AwsRole> {
  return await createIamRole({
    name: `${BASTION_INSTANCE_ROLE_NAME_PREFIX}-${bastionId}`,
    path: BASTION_INSTANCE_ROLE_PATH,
    principalService: 'ec2.amazonaws.com',
  });
}

export async function createBastionRoleInlinePolicies({
  bastionInstanceId,
  bastionRoleName,
}: CreateBastionInlinePoliciesInput): Promise<void> {
  await createIamInlinePolicy({
    roleName: bastionRoleName,
    policyName: 'session-manager-access',
    policyDocument: getSessionManagerAccessPolicy(bastionInstanceId),
  });

  await createIamInlinePolicy({
    roleName: bastionRoleName,
    policyName: 'ec2-instance-access',
    policyDocument: getAwsInstanceAccessPolicy(bastionInstanceId),
  });
}

function getSessionManagerAccessPolicy(bastionInstanceId: string): string {
  return JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['ssm:UpdateInstanceInformation'],
        Resource: `arn:aws:ec2:*:*:instance/${bastionInstanceId}`,
      },
      {
        Effect: 'Allow',
        Action: [
          'ssmmessages:CreateControlChannel',
          'ssmmessages:CreateDataChannel',
          'ssmmessages:OpenControlChannel',
          'ssmmessages:OpenDataChannel',
        ],
        // The actions don't support resource-level permissions
        // https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonsessionmanagermessagegatewayservice.html
        Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: ['s3:GetEncryptionConfiguration'],
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
        Resource: `arn:aws:ec2:*:*:instance/${bastionInstanceId}`,
      },
    ],
  });
}
