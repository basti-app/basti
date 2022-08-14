import { deleteIamRole } from "../aws/iam/delete-iam-role.js";
import { getErrorMessage } from "../common/get-error-message.js";
import { ResourceCleaner } from "./cleanup-errors.js";

export const bastionRoleCleaner: ResourceCleaner = async (roleName) => {
  try {
    await deleteIamRole({ roleName });
  } catch (error) {
    return {
      reason: "UNKNOWN",
      message: getErrorMessage(error),
    };
  }
};
