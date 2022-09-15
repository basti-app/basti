import { createEc2Instance } from '../aws/ec2/create-ec2-instance.js';
import { createSecurityGroup } from '../aws/ec2/create-security-group.js';
import { AwsSecurityGroup } from '../aws/ec2/types/aws-security-group.js';
import { createIamRole } from '../aws/iam/create-iam-role.js';
import { AwsRole } from '../aws/iam/types.js';
import { getStringSsmParameter } from '../aws/ssm/get-ssm-parameter.js';
import { RuntimeError } from '../common/runtime-error.js';
import { generateShortId } from '../common/short-id.js';
import { BASTION_INSTANCE_CLOUD_INIT } from './bastion-cloudinit.js';
import {
  Bastion,
  BASTION_INSTANCE_ID_TAG_NAME,
  BASTION_INSTANCE_IN_USE_TAG_NAME,
  BASTION_INSTANCE_NAME_PREFIX,
  BASTION_INSTANCE_PROFILE_PATH,
  BASTION_INSTANCE_ROLE_NAME_PREFIX,
  BASTION_INSTANCE_ROLE_PATH,
  BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX,
} from './bastion.js';

interface CreateBastionHooks {
  onRetrievingImageId?: () => void;
  onImageIdRetrieved?: (imageId: string) => void;
  onCreatingRole?: () => void;
  onRoleCreated?: (roleId: string) => void;
  onCreatingSecurityGroup?: () => void;
  onSecurityGroupCreated?: (securityGroupId: string) => void;
  onCreatingInstance?: () => void;
  onInstanceCreated?: (instanceId: string) => void;
}

export interface CreateBastionInput {
  vpcId: string;
  subnetId: string;
  hooks?: CreateBastionHooks;
}

export async function createBastion({
  vpcId,
  subnetId,
  hooks,
}: CreateBastionInput): Promise<Bastion> {
  const bastionId = generateShortId();

  const bastionImageId = await getBastionImageId(hooks);

  const bastionRole = await createBastionRole(bastionId, hooks);

  const bastionSecurityGroup = await createBastionSecurityGroup(
    bastionId,
    vpcId,
    hooks
  );

  const bastionInstance = await createBastionInstance(
    bastionId,
    bastionImageId,
    bastionRole,
    subnetId,
    bastionSecurityGroup,
    hooks
  );

  return {
    id: bastionId,

    instance: bastionInstance,

    securityGroupId: bastionSecurityGroup.id,
    securityGroupName: bastionSecurityGroup.name,
  };
}

async function getBastionImageId(hooks?: CreateBastionHooks) {
  try {
    const parameterName =
      '/aws/service/ami-amazon-linux-latest/amzn2-ami-kernel-5.10-hvm-x86_64-gp2';

    hooks?.onRetrievingImageId?.();

    const bastionImageId = await getStringSsmParameter({
      name: parameterName,
    });
    if (!bastionImageId) {
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
  hooks?: CreateBastionHooks
) {
  try {
    hooks?.onCreatingRole?.();
    const bastionRole = await createIamRole({
      name: `${BASTION_INSTANCE_ROLE_NAME_PREFIX}-${bastionId}`,
      path: BASTION_INSTANCE_ROLE_PATH,
      principalService: 'ec2.amazonaws.com',
      managedPolicies: [
        'AmazonSSMManagedInstanceCore',
        'AmazonEC2ReadOnlyAccess',
      ],
    });
    hooks?.onRoleCreated?.(bastionRole.name);
    return bastionRole;
  } catch (error) {
    throw new BastionRoleCreationError(error);
  }
}

async function createBastionSecurityGroup(
  bastionId: string,
  vpcId: string,
  hooks?: CreateBastionHooks
) {
  try {
    hooks?.onCreatingSecurityGroup?.();
    const bastionSecurityGroup = await createSecurityGroup({
      name: `${BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX}-${bastionId}`,
      description:
        'Identifies basti instance and allows connection to the Internet',
      vpcId,
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
  hooks?: CreateBastionHooks
) {
  try {
    hooks?.onCreatingInstance?.();
    const bastionInstance = await createEc2Instance({
      name: `${BASTION_INSTANCE_NAME_PREFIX}-${bastionId}`,
      imageId: bastionImageId,
      instanceType: 't2.micro',
      roleNames: [bastionRole.name],
      profilePath: BASTION_INSTANCE_PROFILE_PATH,
      subnetId,
      assignPublicIp: true,
      securityGroupIds: [bastionSecurityGroup.id],
      userData: BASTION_INSTANCE_CLOUD_INIT,
      tags: [
        {
          key: BASTION_INSTANCE_ID_TAG_NAME,
          value: bastionId,
        },
        {
          key: BASTION_INSTANCE_IN_USE_TAG_NAME,
          value: new Date().toISOString(),
        },
      ],
    });
    hooks?.onInstanceCreated?.(bastionInstance.id);
    return bastionInstance;
  } catch (error) {
    throw new BastionInstanceCreationError(error);
  }
}

export class BastionImageRetrievalError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't get latest EC2 AMI for bastion instance`, cause);
  }
}

export class BastionRoleCreationError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't create IAM role for bastion instance`, cause);
  }
}

export class BastionSecurityGroupCreationError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't create security group for bastion instance`, cause);
  }
}

export class BastionInstanceCreationError extends RuntimeError {
  constructor(cause: unknown) {
    super(`Can't create bastion EC2 instance`, cause);
  }
}
