import type { AwsTag } from '#src/aws/tags/types.js';

import type { DehydratedInitTargetInput } from './select-init-target.js';

export interface InitCommandRequiredInput {
  target?: DehydratedInitTargetInput;
  bastionSubnet?: string;
}

export interface InitCommandAdvancedInput {
  tags: AwsTag[];
  instanceType?: string;
}

export type InitCommandInput = InitCommandRequiredInput &
  InitCommandAdvancedInput;

export function isRequiredInputComplete(input: InitCommandInput): boolean {
  return input.target !== undefined && input.bastionSubnet !== undefined;
}

export function isAdvancedInputComplete(input: InitCommandInput): boolean {
  return input.tags.length > 0 && input.instanceType !== undefined;
}
