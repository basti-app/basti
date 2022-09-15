import { deleteIamRole } from '../aws/iam/delete-iam-role.js';
import { ResourceCleaner } from './resource-cleaner.js';

export const bastionRoleCleaner: ResourceCleaner = async roleName => {
  await deleteIamRole({ roleName });
};
