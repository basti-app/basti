export interface BastionInstance {
  id: string;

  instanceId: string;

  securityGroupId: string;
  securityGroupName: string;
}

export const BASTION_INSTANCE_NAME_PREFIX = "basti-instance";
export const BASTION_INSTANCE_ROLE_NAME_PREFIX = BASTION_INSTANCE_NAME_PREFIX;
export const BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX =
  BASTION_INSTANCE_NAME_PREFIX;

export const BASTION_INSTANCE_ID_TAG_NAME = "basti:id";
export const BASTION_INSTANCE_IN_USE_TAG_NAME = "basti:in-use";
