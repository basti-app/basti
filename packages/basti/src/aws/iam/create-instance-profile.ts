import {
  AddRoleToInstanceProfileCommand,
  CreateInstanceProfileCommand,
  waitUntilInstanceProfileExists,
} from '@aws-sdk/client-iam';

import { COMMON_WAITER_CONFIG } from '../common/waiter-config.js';
import { handleWaiterError } from '../common/waiter-error.js';

import { iamClient } from './iam-client.js';
import { parseIamInstanceProfileResponse } from './parse-iam-response.js';

import type { AwsTag } from '../tags/types.js';
import type { AwsIamInstanceProfile } from './types.js';

export interface CreateInstanceProfileCurrentRegionInput {
  name: string;
  roleNames: string[];
  pathPrefix: string;
  tags: AwsTag[];
}

export async function createIamInstanceProfileCurrentRegion({
  name,
  roleNames,
  pathPrefix,
  tags,
}: CreateInstanceProfileCurrentRegionInput): Promise<AwsIamInstanceProfile> {
  const region = await iamClient.config.region();
  const path = `${pathPrefix}/${region}/`;

  const { InstanceProfile } = await iamClient.send(
    new CreateInstanceProfileCommand({
      InstanceProfileName: name,
      Path: path,
      Tags: tags.map(tag => ({ Key: tag.key, Value: tag.value })),
    })
  );

  if (!InstanceProfile) {
    throw new Error(`Invalid response from AWS.`);
  }

  const instanceProfile = parseIamInstanceProfileResponse(InstanceProfile);

  await handleWaiterError(
    async () =>
      await waitUntilInstanceProfileExists(
        { ...COMMON_WAITER_CONFIG, client: iamClient.client },
        { InstanceProfileName: instanceProfile.name }
      )
  );

  for (const roleName of roleNames) {
    await iamClient.send(
      new AddRoleToInstanceProfileCommand({
        InstanceProfileName: instanceProfile.name,
        RoleName: roleName,
      })
    );
  }

  return instanceProfile;
}
