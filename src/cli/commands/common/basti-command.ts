import { cli } from "../../../common/cli.js";
import { getErrorMessage } from "../../../common/get-error-message.js";
import { BastiError } from "./basti-error.js";

export function bastiCommand<T extends unknown[], R>(
  command: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args) => {
    try {
      return await command(...args);
    } catch (error) {
      handleError(error);
    }
  };
}

function handleError(error: unknown): never {
  const errorMessage =
    error instanceof BastiError
      ? error.message
      : `Unexpected error: ${getErrorMessage(error)}`;

  cli.error(`❌ ${errorMessage}`);

  process.exit(1);
}
