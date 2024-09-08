import { InstanceStateName } from '@aws-sdk/client-ec2';

import type { AwsTag } from '#src/aws/tags/types.js';

import { createEc2Instance } from '../aws/ec2/create-ec2-instance.js';
import { createSecurityGroup } from '../aws/ec2/create-security-group.js';
import { getStringSsmParameter } from '../aws/ssm/get-ssm-parameter.js';
import { generateShortId } from '../common/short-id.js';

import * as bastionRoleOps from './create-bastion-role.js';
import { BASTION_INSTANCE_CLOUD_INIT } from './bastion-cloudinit.js';
import {
  BastionImageRetrievalError,
  BastionInlinePoliciesCreationError,
  BastionInstanceCreationError,
  BastionRoleCreationError,
  BastionSecurityGroupCreationError,
} from './bastion-errors.js';
import {
  BASTION_INSTANCE_ID_TAG_NAME,
  BASTION_INSTANCE_IN_USE_TAG_NAME,
  BASTION_INSTANCE_NAME_PREFIX,
  BASTION_INSTANCE_PROFILE_PATH_PREFIX,
  BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX,
  BASTION_INSTANCE_DEFAULT_INSTANCE_TYPE,
} from './bastion.js';

import type { Bastion } from './bastion.js';
import type { AwsRole } from '../aws/iam/types.js';
import type { AwsSecurityGroup } from '../aws/ec2/types/aws-security-group.js';
import type { AwsEc2Instance } from '../aws/ec2/types/aws-ec2-instance.js';

interface CreateBastionHooks {
  onRetrievingImageId?: () => void;
  onImageIdRetrieved?: (imageId: string) => void;
  onCreatingRole?: () => void;
  onRoleCreated?: (roleId: string) => void;
  onCreatingInlinePolicies?: () => void;
  onInlinePoliciesCreated?: () => void;
  onCreatingSecurityGroup?: () => void;
  onSecurityGroupCreated?: (securityGroupId: string) => void;
  onCreatingInstance?: () => void;
  onInstanceCreated?: (instanceId: string) => void;
}

export interface CreateBastionInput {
  vpcId: string;
  subnetId: string;
  instanceType: string | undefined;
  tags: AwsTag[];
  hooks?: CreateBastionHooks;
}

export async function createBastion({
  vpcId,
  subnetId,
  instanceType,
  tags,
  hooks,
}: CreateBastionInput): Promise<Bastion> {
  const bastionId = generateShortId();

  const bastionImageId = await getBastionImageId(hooks);

  const bastionRole = await createBastionRole(bastionId, tags, hooks);

  const bastionSecurityGroup = await createBastionSecurityGroup(
    bastionId,
    vpcId,
    tags,
    hooks
  );

  const bastionInstance = await createBastionInstance(
    bastionId,
    bastionImageId,
    bastionRole,
    subnetId,
    bastionSecurityGroup,
    instanceType,
    tags,
    hooks
  );

  await createBastionRoleInlinePolicies(
    bastionRole.name,
    bastionInstance.id,
    hooks
  );

  return {
    id: bastionId,

    instance: bastionInstance,

    state: InstanceStateName.running,

    securityGroupId: bastionSecurityGroup.id,
    securityGroupName: bastionSecurityGroup.name,
  };
}

async function getBastionImageId(hooks?: CreateBastionHooks): Promise<string> {
  try {
    const parameterName =
      '/aws/service/ami-amazon-linux-latest/amzn2-ami-kernel-5.10-hvm-x86_64-gp2';

    hooks?.onRetrievingImageId?.();

    const bastionImageId = await getStringSsmParameter({
      name: parameterName,
    });
    if (bastionImageId === undefined) {
      throw new Error(
        `Bastion image ID not found in SSM parameter ${parameterName}`
      );
    }

    hooks?.onImageIdRetrieved?.(bastionImageId);

    return bastionImageId;
  } catch (error) {
    throw new BastionImageRetrievalError(error);
  }
}

async function createBastionRole(
  bastionId: string,
  tags: AwsTag[],
  hooks?: CreateBastionHooks
): Promise<AwsRole> {
  try {
    hooks?.onCreatingRole?.();
    const bastionRole = await bastionRoleOps.createBastionRole({
      bastionId,
      tags,
    });
    hooks?.onRoleCreated?.(bastionRole.name);
    return bastionRole;
  } catch (error) {
    throw new BastionRoleCreationError(error);
  }
}

async function createBastionRoleInlinePolicies(
  bastionRoleName: string,
  bastionInstanceId: string,
  hooks?: CreateBastionHooks
): Promise<void> {
  try {
    hooks?.onCreatingInlinePolicies?.();
    await bastionRoleOps.createBastionRoleInlinePolicies({
      bastionRoleName,
      bastionInstanceId,
    });
    hooks?.onInlinePoliciesCreated?.();
  } catch (error) {
    throw new BastionInlinePoliciesCreationError(error);
  }
}

async function createBastionSecurityGroup(
  bastionId: string,
  vpcId: string,
  tags: AwsTag[],
  hooks?: CreateBastionHooks
): Promise<AwsSecurityGroup> {
  try {
    hooks?.onCreatingSecurityGroup?.();
    const bastionSecurityGroup = await createSecurityGroup({
      name: `${BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX}-${bastionId}`,
      description:
        'Identifies Basti instance and allows connection to the Internet',
      vpcId,
      tags,
      ingressRules: [],
    });
    hooks?.onSecurityGroupCreated?.(bastionSecurityGroup.id);
    return bastionSecurityGroup;
  } catch (error) {
    throw new BastionSecurityGroupCreationError(error);
  }
}

async function createBastionInstance(
  bastionId: string,
  bastionImageId: string,
  bastionRole: AwsRole,
  subnetId: string,
  bastionSecurityGroup: AwsSecurityGroup,
  instanceType: string | undefined,
  tags: AwsTag[],
  hooks?: CreateBastionHooks
): Promise<AwsEc2Instance> {
  try {
    hooks?.onCreatingInstance?.();
    const bastionInstance = await createEc2Instance({
      name: `${BASTION_INSTANCE_NAME_PREFIX}-${bastionId}`,
      imageId: bastionImageId,
      instanceType: instanceType ?? BASTION_INSTANCE_DEFAULT_INSTANCE_TYPE,
      roleNames: [bastionRole.name],
      profilePathPrefix: BASTION_INSTANCE_PROFILE_PATH_PREFIX,
      subnetId,
      assignPublicIp: true,
      securityGroupIds: [bastionSecurityGroup.id],
      userData: BASTION_INSTANCE_CLOUD_INIT,
      requireIMDSv2: true,
      instanceTags: [
        {
          key: BASTION_INSTANCE_ID_TAG_NAME,
          value: bastionId,
        },
        {
          key: BASTION_INSTANCE_IN_USE_TAG_NAME,
          value: new Date().toISOString(),
        },
      ],
      tags,
    });
    hooks?.onInstanceCreated?.(bastionInstance.id);
    return bastionInstance;
  } catch (error) {
    throw new BastionInstanceCreationError(error);
  }
}
