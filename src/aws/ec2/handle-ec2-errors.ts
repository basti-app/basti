import { EC2ServiceException } from "@aws-sdk/client-ec2";
import { AwsAccessDeniedError } from "../common/AwsError.js";

export async function handleEc2Errors<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof EC2ServiceException &&
      error.name === "UnauthorizedOperation"
    ) {
      throw new AwsAccessDeniedError();
    }

    throw error;
  }
}
