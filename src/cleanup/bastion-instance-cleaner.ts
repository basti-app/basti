import { terminateEc2Instances } from "../aws/ec2/terminate-ec2-instances.js";
import { getErrorMessage } from "../common/get-error-message.js";
import { ResourceCleaner } from "./cleanup-errors.js";

export const bastionInstanceCleaner: ResourceCleaner = async (instanceId) => {
  try {
    await terminateEc2Instances({ instanceIds: [instanceId] });
  } catch (error) {
    return {
      reason: "UNKNOWN",
      message: getErrorMessage(error),
    };
  }
};
