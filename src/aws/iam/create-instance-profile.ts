import {
  AddRoleToInstanceProfileCommand,
  CreateInstanceProfileCommand,
  waitUntilInstanceProfileExists,
} from "@aws-sdk/client-iam";
import { COMMON_WAITER_CONFIG } from "../common/waiter-config.js";
import { iamClient } from "./iam-client.js";
import { parseIamInstanceProfileResponse } from "./parse-iam-response.js";
import { AwsIamInstanceProfile } from "./types.js";

export interface CreateInstanceProfileInput {
  name: string;
  roleNames: string[];
  path: string;
}

export async function createIamInstanceProfile({
  name,
  roleNames,
  path,
}: CreateInstanceProfileInput): Promise<AwsIamInstanceProfile> {
  const { InstanceProfile } = await iamClient.send(
    new CreateInstanceProfileCommand({ InstanceProfileName: name, Path: path })
  );

  if (!InstanceProfile) {
    throw new Error(`Invalid response from AWS.`);
  }

  const instanceProfile = parseIamInstanceProfileResponse(InstanceProfile);

  await waitUntilInstanceProfileExists(
    { ...COMMON_WAITER_CONFIG, client: iamClient },
    { InstanceProfileName: instanceProfile.name }
  );

  await Promise.all(
    roleNames.map((roleName) =>
      iamClient.send(
        new AddRoleToInstanceProfileCommand({
          InstanceProfileName: instanceProfile.name,
          RoleName: roleName,
        })
      )
    )
  );

  return instanceProfile;
}
