import { terminateEc2Instances } from "../aws/ec2/terminate-ec2-instances.js";
import { ResourceCleaner } from "./cleanup-errors.js";

export const bastionInstanceCleaner: ResourceCleaner = async (instanceId) => {
  try {
    await terminateEc2Instances({ instanceIds: [instanceId] });
  } catch (error) {
    return {
      reason: "UNKNOWN",
      message: error instanceof Error ? error.message : undefined,
    };
  }
};
