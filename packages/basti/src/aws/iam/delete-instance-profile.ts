import {
  DeleteInstanceProfileCommand,
  RemoveRoleFromInstanceProfileCommand,
} from '@aws-sdk/client-iam';

import { getInstanceProfile } from './get-instance-profiles.js';
import { iamClient } from './iam-client.js';

export interface DeleteInstanceProfileInput {
  name: string;
}

export async function deleteInstanceProfile({
  name,
}: DeleteInstanceProfileInput): Promise<void> {
  const instanceProfile = await getInstanceProfile({ name });

  if (!instanceProfile) {
    throw new Error('Instance profile not found');
  }

  await Promise.all(
    instanceProfile.roles.map(
      async role =>
        await iamClient.send(
          new RemoveRoleFromInstanceProfileCommand({
            InstanceProfileName: name,
            RoleName: role.name,
          })
        )
    )
  );

  await iamClient.send(
    new DeleteInstanceProfileCommand({
      InstanceProfileName: name,
    })
  );
}
