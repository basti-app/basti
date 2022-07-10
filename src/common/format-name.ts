export function formatName({
  id,
  name,
}: {
  id: string;
  name?: string;
}): string {
  return name ? `${id} - ${name}` : id;
}
