import { fmt } from '#src/common/fmt.js';

import { DetailProvider, getErrorDetail } from './get-error-detail.js';

export class OperationError extends Error {
  constructor(
    operationName: string,
    message: string,
    dirtyOperation?: boolean
  ) {
    super(getOperationErrorMessage(operationName, message, dirtyOperation));
  }

  public static from({
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
      dirtyOperation
    );
  }
}

function getOperationErrorMessage(
  operationName: string,
  message: string,
  shouldCleanup?: boolean
): string | undefined {
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
