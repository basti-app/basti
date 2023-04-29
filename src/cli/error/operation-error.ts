import { fmt } from '#src/common/fmt.js';
import { RuntimeError } from '#src/common/runtime-errors.js';

import { DetailProvider, getErrorDetail } from './get-error-detail.js';

export class OperationError extends RuntimeError {
  operationErrorMessage: string;

  constructor(
    operationName: string,
    message: string,
    cause?: unknown,
    dirtyOperation?: boolean
  ) {
    super(message, cause);

    this.operationErrorMessage = getOperationErrorMessage(
      operationName,
      message,
      dirtyOperation
    );
  }

  public static fromErrorMessage({
    operationName,
    message,
    dirtyOperation,
  }: {
    operationName: string;
    message: string;
    dirtyOperation?: boolean;
  }): OperationError {
    return new OperationError(
      operationName,
      message,
      undefined,
      dirtyOperation
    );
  }

  public static fromError({
    operationName,
    error,
    detailProviders,
    dirtyOperation,
  }: {
    operationName: string;
    error: unknown;
    detailProviders?: DetailProvider[];
    dirtyOperation?: boolean;
  }): OperationError {
    return new OperationError(
      operationName,
      getErrorDetail(error, detailProviders),
      error,
      dirtyOperation
    );
  }
}

function getOperationErrorMessage(
  operationName: string,
  message: string,
  shouldCleanup?: boolean
): string {
  const dirtyOperationMessage =
    shouldCleanup === true
      ? `. This operation might have already created AWS resources. Please, run ${fmt.code(
          'basti cleanup'
        )} before retrying`
      : '';

  return (
    `Error ${fmt.lower(operationName)}. ${fmt.capitalize(message)}` +
    dirtyOperationMessage
  );
}
