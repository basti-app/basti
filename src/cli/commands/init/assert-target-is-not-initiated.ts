import { fmt } from '#src/common/fmt.js';
import { InitTarget } from '#src/target/init-target.js';

import { EarlyExitError } from '../../error/early-exit-error.js';
import { handleOperation } from '../common/handle-operation.js';

export interface AssertTargetIsNotInitiatedInput {
  target: InitTarget;
}

export async function assertTargetIsNotInitialized({
  target,
}: AssertTargetIsNotInitiatedInput): Promise<void> {
  const targetInitialized = await handleOperation(
    'Checking target state',
    async () => await target.isInitialized()
  );

  if (targetInitialized) {
    throw new EarlyExitError(
      `The selected target has already been initialized. If you'd like to re-initialize Basti, please, clean up your account first by running ${fmt.code(
        'basti cleanup'
      )}`
    );
  }
}
