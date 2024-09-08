import type { InstanceStateName } from '@aws-sdk/client-ec2';
import type { AwsEc2Instance } from '../aws/ec2/types/aws-ec2-instance.js';

export interface Bastion {
  id: string;

  instance: AwsEc2Instance;

  state: BastionState;

  securityGroupId: string;
  securityGroupName: string;
}

export type BastionState = InstanceStateName | 'updating';

export const BASTION_INSTANCE_NAME_PREFIX = 'basti-instance';
export const BASTION_INSTANCE_ROLE_NAME_PREFIX = BASTION_INSTANCE_NAME_PREFIX;
export const BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX =
  BASTION_INSTANCE_NAME_PREFIX;
export const BASTION_INSTANCE_ROLE_PATH_PREFIX = `/basti`;
export const BASTION_INSTANCE_PROFILE_PATH_PREFIX = BASTION_INSTANCE_ROLE_PATH_PREFIX;

export const BASTION_INSTANCE_ID_TAG_NAME = 'basti:id';
export const BASTION_INSTANCE_IN_USE_TAG_NAME = 'basti:in-use';
export const BASTION_INSTANCE_UPDATING_TAG_NAME = 'basti:updating';
export const BASTION_INSTANCE_UPDATED_TAG_NAME = 'basti:updated';

export const BASTION_INSTANCE_DEFAULT_INSTANCE_TYPE = 't2.micro';
