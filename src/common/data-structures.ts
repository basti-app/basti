export function indexBy<T>(array: T[], key: keyof T): Record<string, T> {
  const result: Record<string, T> = {};

  for (const item of array) {
    result[item[key] as unknown as string] = item;
  }

  return result;
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  return Object.values(indexBy(array, key));
}
