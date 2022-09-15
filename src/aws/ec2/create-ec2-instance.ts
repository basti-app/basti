import {
  RunInstancesCommand,
  waitUntilInstanceRunning,
} from '@aws-sdk/client-ec2';
import { retry } from '../../common/retry.js';
import { handleWaiterError } from '../common/waiter-error.js';
import { COMMON_WAITER_CONFIG } from '../common/waiter-config.js';
import { createIamInstanceProfile } from '../iam/create-instance-profile.js';
import { AwsTag } from '../tags/types.js';
import { AwsInstanceProfileNotFoundError, ec2Client } from './ec2-client.js';
import { parseEc2InstanceResponse } from './parse-ec2-response.js';
import { AwsEc2Instance } from './types/aws-ec2-instance.js';

export interface CreateEc2InstanceInput {
  imageId: string;
  name: string;
  instanceType: string;

  roleNames: string[];
  profilePath: string;

  subnetId: string;
  assignPublicIp: boolean;
  securityGroupIds: string[];

  userData?: string;

  tags: AwsTag[];
}

export async function createEc2Instance({
  imageId,
  name,
  instanceType,
  roleNames,
  profilePath,
  subnetId,
  assignPublicIp,
  securityGroupIds,
  userData,
  tags,
}: CreateEc2InstanceInput): Promise<AwsEc2Instance> {
  const instanceProfile = await createIamInstanceProfile({
    name,
    roleNames,
    path: profilePath,
  });

  const { Instances } = await retry(
    async () =>
      await ec2Client.send(
        new RunInstancesCommand({
          ImageId: imageId,
          InstanceType: instanceType,

          IamInstanceProfile: {
            Name: instanceProfile.name,
          },

          NetworkInterfaces: [
            {
              DeviceIndex: 0,
              AssociatePublicIpAddress: assignPublicIp,
              Groups: securityGroupIds,
              SubnetId: subnetId,
            },
          ],

          UserData:
            userData != null
              ? Buffer.from(userData).toString('base64')
              : undefined,

          TagSpecifications: [
            {
              ResourceType: 'instance',
              Tags: tags
                .map(tag => ({ Key: tag.key, Value: tag.value }))
                .concat({ Key: 'Name', Value: name }),
            },
          ],

          MinCount: 1,
          MaxCount: 1,
        })
      ),
    {
      delay: 3000,
      maxRetries: 10,
      shouldRetry: isInstanceProfileNotFoundError,
    }
  );
  if (Instances == null || Instances.length === 0) {
    throw new Error(`Invalid response from AWS.`);
  }
  const instance = parseEc2InstanceResponse(Instances[0]);

  await handleWaiterError(
    async () =>
      await waitUntilInstanceRunning(
        { ...COMMON_WAITER_CONFIG, client: ec2Client.client },
        { InstanceIds: [instance.id] }
      )
  );

  return instance;
}

function isInstanceProfileNotFoundError(error: unknown): boolean {
  return error instanceof AwsInstanceProfileNotFoundError;
}
