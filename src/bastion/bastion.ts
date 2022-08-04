import { AwsEc2Instance } from "../aws/ec2/types/aws-ec2-instance.js";

export interface Bastion {
  id: string;

  instance: AwsEc2Instance;

  securityGroupId: string;
  securityGroupName: string;
}

export interface BastionState {
  id: string;
  instance: AwsEc2Instance;
}

export const BASTION_INSTANCE_NAME_PREFIX = "basti-instance";
export const BASTION_INSTANCE_ROLE_NAME_PREFIX = BASTION_INSTANCE_NAME_PREFIX;
export const BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX =
  BASTION_INSTANCE_NAME_PREFIX;

export const BASTION_INSTANCE_ID_TAG_NAME = "basti:id";
export const BASTION_INSTANCE_IN_USE_TAG_NAME = "basti:in-use";
