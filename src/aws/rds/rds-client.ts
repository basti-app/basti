import { RDSClient, RDSServiceException } from "@aws-sdk/client-rds";
import { AwsClient } from "../common/aws-client.js";
import { AwsAccessDeniedError, AwsError } from "../common/aws-error.js";

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

    if (
      error instanceof RDSServiceException &&
      error.name === "InvalidParameterCombination" &&
      error.message.toLowerCase().includes("securitygroup")
    ) {
      throw new AwsTooManySecurityGroupsAttachedError();
    }

    throw error;
  }
}

export class AwsTooManySecurityGroupsAttachedError extends AwsError {
  constructor() {
    super(`Too many security groups attached`);
  }
}
