import { RDSClient, RDSServiceException } from "@aws-sdk/client-rds";
import { AwsClient } from "../common/aws-client.js";
import { AwsAccessDeniedError } from "../common/aws-error.js";

export const rdsClient = new AwsClient({
  client: RDSClient,
  errorHandler,
});

export async function errorHandler<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof RDSServiceException && error.name === "AccessDenied") {
      throw new AwsAccessDeniedError();
    }

    throw error;
  }
}
