import { AwsAccessDeniedError } from "../../../aws/common/AwsError.js";
import { cli } from "../../../common/cli.js";
import { ExpectedBastiError, UnexpectedBastiError } from "./basti-error.js";

export async function handleOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    cli.progressStart(operationName);
    const result = await operation();
    cli.progressStop();
    return result;
  } catch (error) {
    handleError(error, operationName);
  } finally {
    cli.progressStop();
  }
}

function handleError(error: unknown, operationName: string): never {
  const errorMessage = `Error ${operationName}`;

  if (error instanceof AwsAccessDeniedError) {
    throw new ExpectedBastiError(`${errorMessage}. Access denied by IAM`);
  }
  throw new UnexpectedBastiError(errorMessage, error);
}
