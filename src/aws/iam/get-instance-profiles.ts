import {
  GetInstanceProfileCommand,
  ListInstanceProfilesCommand,
} from '@aws-sdk/client-iam';
import { iamClient } from './iam-client.js';
import { parseIamInstanceProfileResponse } from './parse-iam-response.js';
import { AwsIamInstanceProfile } from './types.js';

export interface GetInstanceProfilesInput {
  path: string;
}

export interface GetInstanceProfileInput {
  name: string;
}

export async function getInstanceProfiles({
  path,
}: GetInstanceProfilesInput): Promise<AwsIamInstanceProfile[]> {
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
