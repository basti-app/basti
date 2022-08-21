import { getErrorMessage } from "./get-error-message.js";

export class RuntimeError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(cause ? `${message}. ${getErrorMessage(cause)}` : message);

    this.cause = cause;
  }
}

export class ResourceNotFoundError extends RuntimeError {
  public readonly resourceId: string;

  constructor(resourceId: string) {
    super(`Resource "${resourceId}" not found`);

    this.resourceId = resourceId;
  }
}
