const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, initialDelayMs = 1000 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLast = attempt >= maxAttempts;
      const status = (error as { status?: number }).status;
      const isRetryable = status !== undefined && RETRYABLE_STATUS_CODES.has(status);

      if (isLast || !isRetryable) throw error;

      const delayMs = initialDelayMs * Math.pow(3, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Max retry attempts reached');
}
