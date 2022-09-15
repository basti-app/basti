export interface RetryConfig {
  delay: number;
  maxRetries: number;
  shouldRetry: (error: unknown) => boolean;
}

const DEFAULT_CONFIG: RetryConfig = {
  delay: 3000,
  maxRetries: 3,
  shouldRetry: () => true,
};

export async function retry<T>(
  action: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...DEFAULT_CONFIG, ...retryConfig };

  let retries = 0;

  do {
    try {
      return await action();
    } catch (error) {
      if (retries < config.maxRetries && config.shouldRetry(error)) {
        retries++;
        await delay(config.delay);
      } else {
        throw error;
      }
    }
  } while (true);
}

async function delay(timeMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeMs));
}
