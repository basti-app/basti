import { cli } from '#src/common/cli.js';

import {
  isRequiredInputComplete,
  type InitCommandAdvancedInput,
  type InitCommandInput,
  isAdvancedInputComplete,
} from '../init-command-input.js';

import { selectTags } from './select-tags.js';

export async function selectAdvancedInput(
  input: InitCommandInput
): Promise<InitCommandAdvancedInput> {
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

  return {
    tags: await selectTags(input.tags),
  };
}
