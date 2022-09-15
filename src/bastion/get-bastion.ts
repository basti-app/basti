import { getEc2Instances } from '../aws/ec2/get-ec2-instances.js';
import { ManagedResourceTypes } from '../common/resource-type.js';
import {
  ResourceDamagedError,
  UnexpectedStateError,
} from '../common/runtime-error.js';
import {
  Bastion,
  BASTION_INSTANCE_ID_TAG_NAME,
  BASTION_INSTANCE_SECURITY_GROUP_NAME_PREFIX,
} from './bastion.js';

export interface GetBastionInput {
  bastionId?: string;
  vpcId?: string;
}

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
    states: ['pending', 'running', 'stopping', 'stopped'],
    vpcId,
  });

  if (instance == null) {
    return;
  }

  const id = instance.tags[BASTION_INSTANCE_ID_TAG_NAME];
  if (id == null) {
    throw new UnexpectedStateError(
      new ResourceDamagedError(
        ManagedResourceTypes.BASTION_INSTANCE,
        instance.id,
        `"${BASTION_INSTANCE_ID_TAG_NAME}" tag is missing`
      )
    );
  }

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

  return {
    id,
    instance,
    securityGroupId: securityGroup.id,
    securityGroupName: securityGroup.name,
  };
}
