import { cli } from "../../common/cli.js";
import { getErrorMessage } from "../../common/get-error-message.js";
import { OperationError } from "./operation-error.js";

export function withErrorHandling<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      handleError(error);
    }
  };
}

export function handleAsyncErrors(): void {
  process.on("uncaughtException", (error) => {
    handleError(error);
  });
}

function handleError(error: unknown): never {
  const errorMessage =
    error instanceof OperationError
      ? error.message
      : `Unexpected error: ${getErrorMessage(error)}`;

  cli.error(errorMessage);

  process.exit(1);
}
