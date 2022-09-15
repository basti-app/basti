import { InstanceStateName } from '@aws-sdk/client-ec2';
import { AwsTags } from '../../tags/types.js';
import { AwsSecurityGroupIdentifier } from './aws-security-group.js';

export interface AwsEc2Instance {
  id: string;
  name?: string;

  vpcId: string;
  securityGroups: AwsSecurityGroupIdentifier[];

  state: InstanceStateName;

  tags: AwsTags;
}
