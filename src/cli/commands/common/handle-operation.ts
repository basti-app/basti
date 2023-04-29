import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';

import { DetailProvider } from '../../error/get-error-detail.js';
import { OperationError } from '../../error/operation-error.js';

export async function handleOperation<T>(
  operationName: string,
  handler: () => Promise<T>,
  detailProviders: DetailProvider[] = []
): Promise<T> {
  try {
    cli.progressStart(fmt.capitalize(operationName));
    return await handler();
  } catch (error) {
    throw OperationError.fromError({
      operationName,
      error,
      detailProviders,
    });
  } finally {
    cli.progressStop();
  }
}
