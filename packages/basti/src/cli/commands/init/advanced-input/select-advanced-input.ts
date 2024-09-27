import { cli } from '#src/common/cli.js';

import {
  isRequiredInputComplete,
  type InitCommandAdvancedInput,
  type InitCommandInput,
  isAdvancedInputComplete,
} from '../init-command-input.js';

import { selectAssignPublicIp } from './select-assign-public-ip.js';
import { selectInstanceType } from './select-instance-type.js';
import { selectTags } from './select-tags.js';

export async function selectAdvancedInput(
  input: InitCommandInput
): Promise<InitCommandAdvancedInput> {
  // If the required input is complete, Basti must skip any other interactive
  // input and proceed to execution immediately.
  if (isRequiredInputComplete(input) || isAdvancedInputComplete(input)) {
    return input;
  }

  const { proceedToAdvancedOptions } = await cli.prompt({
    type: 'confirm',
    name: 'proceedToAdvancedOptions',
    message: 'Proceed to advanced options?',
    default: false,
  });
  if (!(proceedToAdvancedOptions as boolean)) {
    return input;
  }

  const instanceType = await selectInstanceType(input.instanceType);
  const assignPublicIp = await selectAssignPublicIp(input.assignPublicIp);
  const tags = await selectTags(input.tags);

  return {
    instanceType,
    assignPublicIp,
    tags,
  };
}
