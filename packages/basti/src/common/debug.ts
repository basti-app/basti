export function setUpDebugMode(): void {
  if (!isDebugMode()) {
    return;
  }

  console.log('>>>         Basti is running in debug mode         <<<');
  console.log('>>> Visual glitches are possible due to debug logs <<<');

  Error.stackTraceLimit = Number.POSITIVE_INFINITY;
}

export function isDebugMode(): boolean {
  return process.env.DEBUG === 'true';
}
