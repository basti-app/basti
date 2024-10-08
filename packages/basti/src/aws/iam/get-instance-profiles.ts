import {
  GetInstanceProfileCommand,
  ListInstanceProfilesCommand,
} from '@aws-sdk/client-iam';

import { iamClient } from './iam-client.js';
import { parseIamInstanceProfileResponse } from './parse-iam-response.js';

import type { AwsIamInstanceProfile } from './types.js';

export interface GetInstanceProfilesCurrentRegionInput {
  pathPrefix: string;
}

export interface GetInstanceProfileInput {
  name: string;
}

export async function getInstanceProfilesCurrentRegion({
  pathPrefix,
}: GetInstanceProfilesCurrentRegionInput): Promise<AwsIamInstanceProfile[]> {
  const region = await iamClient.config.region();
  const path = `${pathPrefix}/${region}/`;

  const { InstanceProfiles } = await iamClient.send(
    new ListInstanceProfilesCommand({
      PathPrefix: path,
    })
  );

  if (!InstanceProfiles) {
    throw new Error(`Invalid response from AWS.`);
  }

  return InstanceProfiles.map(profile =>
    parseIamInstanceProfileResponse(profile)
  );
}

export async function getInstanceProfile({
  name,
}: GetInstanceProfileInput): Promise<AwsIamInstanceProfile | undefined> {
  const { InstanceProfile } = await iamClient.send(
    new GetInstanceProfileCommand({
      InstanceProfileName: name,
    })
  );

  if (!InstanceProfile) {
    return;
  }

  return parseIamInstanceProfileResponse(InstanceProfile);
}
