import { fmt } from "../../common/fmt.js";
import { ErrorMessageProvider, getErrorDetail } from "./get-error-detail.js";

export class OperationError extends Error {
  constructor(operationName: string, message: string) {
    super(`Error ${operationName}. ${fmt.capitalize(message)}`);
  }

  public static from(
    operationName: string,
    error: unknown,
    messageProviders?: ErrorMessageProvider[]
  ): OperationError {
    return new OperationError(
      operationName,
      getErrorDetail(error, messageProviders)
    );
  }
}
