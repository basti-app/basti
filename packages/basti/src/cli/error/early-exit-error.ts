export class EarlyExitError extends Error {
  readonly debugInfo?: string;

  constructor(message: string, debugInfo?: string) {
    super(message);

    this.debugInfo = debugInfo;
  }
}
