/* eslint-disable unicorn/no-process-exit */

import { cli } from '~/common/cli.js';
import { getErrorMessage } from '~/common/get-error-message.js';

import { EarlyExitError } from './early-exit-error.js';
import { OperationError } from './operation-error.js';

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
  process.on('uncaughtException', error => {
    handleError(error);
  });
}

function handleError(error: unknown): never {
  if (error instanceof EarlyExitError) {
    cli.info(error.message);
    process.exit(0);
  }

  if (error instanceof OperationError) {
    cli.error(error.message);
    process.exit(1);
  }

  cli.error(`Unexpected error: ${getErrorMessage(error)}`);
  process.exit(1);
}
