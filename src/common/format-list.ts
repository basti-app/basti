export interface FormatListOptions {
  indent: number;
}

export function formatList(
  items: string[],
  options?: FormatListOptions
): string {
  const { indent }: FormatListOptions = {
    indent: 1,
    ...options,
  };

  const prefix = getItemPrefix(indent);

  return prefix + items.join("\n" + prefix);
}

function getItemPrefix(indent: number): string {
  return "  ".repeat(indent).concat("• ");
}
