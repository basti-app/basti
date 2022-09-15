import { isOptionInArgs, YargsCheck } from './yargs-check.js';

export function conflictingOptions(
  ...options: Array<string | string[]>
): YargsCheck {
  return args => {
    const presentArgumentGroups = options
      .map(toOptionGroup)
      .filter(group => isOptionGroupInArgs(group, args));

    if (presentArgumentGroups.length > 1) {
      throw new Error(
        `The following options are mutually exclusive: ${formatList(options)}`
      );
    }

    return true;
  };
}

function toOptionGroup(option: string | string[]): string[] {
  return Array.isArray(option) ? option : [option];
}

function isOptionGroupInArgs(
  optionGroup: string[],
  args: Record<string, unknown>
): boolean {
  return optionGroup.some(option => isOptionInArgs(option, args));
}

function formatList(options: Array<string | string[]>): string {
  return options
    .map(option => (Array.isArray(option) ? `[${option.join(', ')}]` : option))
    .join(', ');
}
