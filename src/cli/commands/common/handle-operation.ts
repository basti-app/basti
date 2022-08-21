import { cli } from "../../../common/cli.js";
import { fmt } from "../../../common/fmt.js";
import { ErrorMessageProvider } from "../../error/get-error-detail.js";
import { OperationError } from "../../error/operation-error.js";

export async function handleOperation<T>(
  operationName: string,
  handler: () => Promise<T>,
  errorProviders: ErrorMessageProvider[] = []
): Promise<T> {
  try {
    cli.progressStart(fmt.capitalize(operationName));
    return await handler();
  } catch (error) {
    throw OperationError.from(operationName, error, errorProviders);
  } finally {
    cli.progressStop();
  }
}
