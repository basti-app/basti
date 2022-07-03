import { AddRoleToInstanceProfileCommand } from "@aws-sdk/client-iam";
import {
  createInstanceProfile,
  CreateInstanceProfileInput,
} from "./create-instance-profile.js";
import { iamClient } from "./iam-client.js";
import { AwsInstanceProfile } from "./types.js";

export interface CreateInstanceProfileWithRolesInput
  extends CreateInstanceProfileInput {
  roleNames: string[];
}

export async function createInstanceProfileWithRoles(
  input: CreateInstanceProfileWithRolesInput
): Promise<AwsInstanceProfile> {
  const { roleNames } = input;

  const instanceProfile = await createInstanceProfile(input);

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
