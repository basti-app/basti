import { RDSServiceException } from "@aws-sdk/client-rds";
import { AwsAccessDeniedError } from "../common/AwsError.js";

export async function handleRdsErrors<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof RDSServiceException && error.name === "AccessDenied") {
      throw new AwsAccessDeniedError();
    }

    throw error;
  }
}
