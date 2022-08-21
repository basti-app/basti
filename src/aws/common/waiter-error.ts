import { AwsError } from "./aws-error.js";

export async function handleWaiterError(
  waiter: () => Promise<unknown>
): Promise<void> {
  try {
    await waiter();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("timed out")
    ) {
      throw new AwsTimeoutError();
    }
  }
}

export class AwsTimeoutError extends AwsError {
  constructor() {
    super("Operation timed out");
  }
}
