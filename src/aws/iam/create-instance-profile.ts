import {
  AddRoleToInstanceProfileCommand,
  CreateInstanceProfileCommand,
  waitUntilInstanceProfileExists,
} from "@aws-sdk/client-iam";
import { COMMON_WAITER_CONFIG } from "../common/waiter-config.js";
import { iamClient } from "./iam-client.js";
import { parseIamInstanceProfile } from "./parse-iam-response.js";
import { AwsIamInstanceProfile } from "./types.js";

export interface CreateInstanceProfileInput {
  name: string;
  roleNames: string[];
}

export async function createIamInstanceProfile({
  name,
  roleNames,
}: CreateInstanceProfileInput): Promise<AwsIamInstanceProfile> {
  const { InstanceProfile } = await iamClient.send(
    new CreateInstanceProfileCommand({ InstanceProfileName: name })
  );

  if (!InstanceProfile) {
    throw new Error(`Invalid response from AWS.`);
  }

  const instanceProfile = parseIamInstanceProfile(InstanceProfile);

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
