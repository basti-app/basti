import { CreateInstanceProfileCommand } from "@aws-sdk/client-iam";
import { iamClient } from "./iam-client.js";
import { AwsInstanceProfile } from "./types.js";

export interface CreateInstanceProfileInput {
  name: string;
}

export async function createInstanceProfile({
  name,
}: CreateInstanceProfileInput): Promise<AwsInstanceProfile> {
  const { InstanceProfile } = await iamClient.send(
    new CreateInstanceProfileCommand({ InstanceProfileName: name })
  );

  if (!InstanceProfile || !InstanceProfile.InstanceProfileName) {
    throw new Error(`Invalid response from AWS.`);
  }

  return {
    name: InstanceProfile.InstanceProfileName,
  };
}
