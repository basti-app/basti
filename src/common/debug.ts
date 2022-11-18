export function setUpDebugMode(): void {
  if (!isDebugMode()) {
    return;
  }

  Error.stackTraceLimit = Number.POSITIVE_INFINITY;
}

export function isDebugMode(): boolean {
  return process.env.DEBUG === 'true';
}
