import { deleteInstanceProfile } from '../aws/iam/delete-instance-profile.js';

import type { ResourceCleaner } from './resource-cleaner.js';

export const bastionInstanceProfileCleaner: ResourceCleaner =
  async profileName => {
    await deleteInstanceProfile({ name: profileName });
  };
