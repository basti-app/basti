import { getErrorMessage } from "../../../common/get-error-message.js";

export class BastiError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "BastiError";
  }
}

export class ExpectedBastiError extends BastiError {
  constructor(message: string) {
    super(message);
    this.name = "ExpectedBastiError";
  }
}

export class UnexpectedBastiError extends BastiError {
  constructor(message: string, error: unknown) {
    super(`${message}. Unexpected error: ${getErrorMessage(error)}`);
    this.name = "UnexpectedBastiError";
  }
}
