import type { InitTarget } from '#src/target/init-target.js';
import type {
  CustomInitTargetInput,
  InitTargetInput,
} from '#src/target/target-input.js';
import { createInitTarget } from '#src/target/create-init-target.js';

import { promptForCustomTargetVpc } from '../common/prompt-for-custom-target-vpc.js';
import { promptForAwsTarget } from '../common/prompt-for-aws-target.js';
import { handleOperation } from '../common/handle-operation.js';
import { hydrateAwsTarget } from '../common/hydrate-aws-target.js';

import type { DehydratedAwsTargetInput } from '../common/hydrate-aws-target.js';
import { AwsClientConfiguration } from '#src/aws/common/aws-client.js';

export type DehydratedInitTargetInput =
  | DehydratedAwsTargetInput
  | { customTargetVpcId: string }
   & {
    awsClientConfig?: AwsClientConfiguration;
  };

export async function selectInitTarget(
  dehydratedInput?: DehydratedInitTargetInput
): Promise<InitTarget> {
  const targetInput = dehydratedInput
    ? await handleOperation(
        'Retrieving specified target',
        async () => await hydrateInput(dehydratedInput)
      )
    : await promptForTarget();

  return createInitTarget(targetInput);
}

async function hydrateInput(
  targetInput: DehydratedInitTargetInput
): Promise<InitTargetInput> {
  if ('customTargetVpcId' in targetInput) {
    return {
      custom: {
        vpcId: targetInput.customTargetVpcId,
      },
    };
  }

  return await hydrateAwsTarget(targetInput);
}

async function promptForTarget(): Promise<InitTargetInput> {
  return (await promptForAwsTarget('init')) ?? (await promptForCustomTarget());
}

async function promptForCustomTarget(): Promise<CustomInitTargetInput> {
  const vpcId = await promptForCustomTargetVpc();

  return { custom: { vpcId } };
}
