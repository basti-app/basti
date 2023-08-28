import { fmt } from '#src/common/fmt.js';
import type { ConnectTarget } from '#src/target/connect-target.js';

import { EarlyExitError } from '../../error/early-exit-error.js';
import { handleOperation } from '../common/handle-operation.js';

export interface AssertTargetIsInitializedInput {
  target: ConnectTarget;
}

export async function assertTargetIsInitialized({
  target,
}: AssertTargetIsInitializedInput): Promise<void> {
  const targetInitialized = await handleOperation(
    'Checking target state',
    async () => await target.isInitialized()
  );

  if (!targetInitialized) {
    throw new EarlyExitError(
      `The selected target has not been initialized to use with Basti. Please, use ${fmt.code(
        'basti init'
      )} to initialize the target`
    );
  }
}
