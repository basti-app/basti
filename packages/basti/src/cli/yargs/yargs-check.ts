export type YargsCheck = (args: Record<string, unknown>) => boolean;

export function isOptionInArgs(
  option: string,
  args: Record<string, unknown>
): boolean {
  return args[option] !== undefined;
}
