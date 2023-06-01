import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';

import { OperationError } from '../../error/operation-error.js';

import type { DetailProvider } from '../../error/get-error-detail.js';

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
