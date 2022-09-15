import { isOptionInArgs } from './yargs-check.js';

export function optionGroup(
  ...options: string[]
): (args: Record<string, unknown>) => boolean {
  return args => {
    const presentOptions = options.filter(option =>
      isOptionInArgs(option, args)
    );

    if (presentOptions.length > 0 && presentOptions.length < options.length) {
      throw new Error(
        `The following options must be used together: ${options.join(', ')}`
      );
    }

    return true;
  };
}
