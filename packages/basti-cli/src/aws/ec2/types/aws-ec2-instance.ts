import type { InstanceStateName } from '@aws-sdk/client-ec2';
import type { AwsTags } from '../../tags/types.js';
import type { AwsSecurityGroupIdentifier } from './aws-security-group.js';

export interface AwsEc2Instance {
  id: string;
  name?: string;

  vpcId: string;
  securityGroups: AwsSecurityGroupIdentifier[];

  state: InstanceStateName;

  tags: AwsTags;
}
