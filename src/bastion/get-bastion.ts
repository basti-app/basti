import { InstanceStateName } from '@aws-sdk/client-ec2';

import type { AwsEc2Instance } from '#src/aws/ec2/types/aws-ec2-instance.js';
import type { AwsSecurityGroupIdentifier } from '#src/aws/ec2/types/aws-security-group.js';

import { getEc2Instances } from '../aws/ec2/get-ec2-instances.js';
import { ManagedResourceTypes } from '../common/resource-type.js';
import {
  ResourceDamagedError,
  UnexpectedStateError,
} from '../common/runtime-errors.js';

import {
  BASTION_INSTANCE_ID_TAG_NAME,
  BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX,
  BASTION_INSTANCE_UPDATING_TAG_NAME,
} from './bastion.js';

import type { Bastion, BastionState } from './bastion.js';

export interface GetBastionInput {
  bastionId?: string;
  vpcId?: string;
}

const BASTION_INSTANCE_UPDATING_TIMEOUT = 1000 * 60 * 10;

export async function getBastion({
  bastionId,
  vpcId,
}: GetBastionInput): Promise<Bastion | undefined> {
  const [instance] = await getEc2Instances({
    tags: [
      {
        key: BASTION_INSTANCE_ID_TAG_NAME,
        value: bastionId ?? '*',
      },
    ],
    states: [
      InstanceStateName.pending,
      InstanceStateName.running,
      InstanceStateName.stopping,
      InstanceStateName.stopped,
    ],
    vpcId,
  });

  if (instance === undefined) {
    return;
  }

  const id = getBastionId(instance);

  const state = getBastionInstanceState(instance);

  const securityGroup = getBastionInstanceSecurityGroup(instance);

  return {
    id,
    instance,
    state,
    securityGroupId: securityGroup.id,
    securityGroupName: securityGroup.name,
  };
}

function getBastionId(instance: AwsEc2Instance): string {
  const id = instance.tags[BASTION_INSTANCE_ID_TAG_NAME];
  if (id === undefined) {
    throw new UnexpectedStateError(
      new ResourceDamagedError(
        ManagedResourceTypes.BASTION_INSTANCE,
        instance.id,
        `"${BASTION_INSTANCE_ID_TAG_NAME}" tag is missing`
      )
    );
  }
  return id;
}

function getBastionInstanceState(instance: AwsEc2Instance): BastionState {
  const now = new Date();

  const updatingTime = parseTimeTag(
    instance,
    BASTION_INSTANCE_UPDATING_TAG_NAME
  );

  if (
    // Instance is running
    instance.state === InstanceStateName.running &&
    // It started updating
    updatingTime !== undefined &&
    // The update started recently
    now.getTime() - updatingTime.getTime() < BASTION_INSTANCE_UPDATING_TIMEOUT
  ) {
    return 'updating';
  }

  return instance.state;
}

function getBastionInstanceSecurityGroup(
  instance: AwsEc2Instance
): AwsSecurityGroupIdentifier {
  const securityGroup = instance.securityGroups.find(group =>
    group.name.startsWith(BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX)
  );
  if (!securityGroup) {
    throw new UnexpectedStateError(
      new ResourceDamagedError(
        ManagedResourceTypes.BASTION_INSTANCE,
        instance.id,
        `No bastion security group associated with the instance`
      )
    );
  }
  return securityGroup;
}

function parseTimeTag(
  instance: AwsEc2Instance,
  tagName: string
): Date | undefined {
  const vagValue = instance.tags[tagName];

  if (vagValue === undefined) {
    return;
  }

  try {
    return new Date(vagValue);
  } catch {
    throw new UnexpectedStateError(
      new ResourceDamagedError(
        ManagedResourceTypes.BASTION_INSTANCE,
        instance.id,
        `"${tagName}" tag has invalid value`
      )
    );
  }
}
