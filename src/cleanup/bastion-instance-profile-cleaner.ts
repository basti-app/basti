import { deleteInstanceProfile } from "../aws/iam/delete-instance-profile.js";
import { getErrorMessage } from "../common/get-error-message.js";
import { ResourceCleaner } from "./cleanup-errors.js";

export const bastionInstanceProfileCleaner: ResourceCleaner = async (
  profileName
) => {
  try {
    await deleteInstanceProfile({ name: profileName });
  } catch (error) {
    return {
      reason: "UNKNOWN",
      message: getErrorMessage(error),
    };
  }
};
