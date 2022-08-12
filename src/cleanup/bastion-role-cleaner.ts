import { deleteIamRole } from "../aws/iam/delete-iam-role.js";
import { ResourceCleaner } from "./cleanup-errors.js";

export const bastionRoleCleaner: ResourceCleaner = async (roleName) => {
  try {
    await deleteIamRole({ roleName });
  } catch (error) {
    return {
      reason: "UNKNOWN",
      message: error instanceof Error ? error.message : undefined,
    };
  }
};
