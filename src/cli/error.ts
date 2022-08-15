import { cli } from "../common/cli.js";
import { getErrorMessage } from "../common/get-error-message.js";

export class AppError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "AppError";
  }
}

export class ExpectedError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = "ExpectedError";
  }
}

export class UnexpectedError extends AppError {
  constructor(message: string, error: unknown) {
    super(`${message}. Unexpected error: ${getErrorMessage(error)}`);
    this.name = "UnexpectedError";
  }
}

export function withErrorHandling<T extends any[], R>(
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
  if (error instanceof AppError) {
    cli.error(error.message);
  } else {
    cli.error(`Unexpected error: ${getErrorMessage(error)}`);
  }

  process.exit(1);
}
