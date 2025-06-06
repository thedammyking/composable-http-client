import type { RetryDelay } from '../types/base';
import { RetryError } from '../errors';

export async function retry<T>(
  fn: () => Promise<T>,
  options?: { retries?: number; delay?: RetryDelay }
): Promise<T> {
  const { retries = 1, delay = 100 } = options ?? {};
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (e: unknown) {
      lastError = e as Error;
      const error = e as { response?: { status?: number }; status?: number };
      const status = error?.response?.status ?? error?.status ?? undefined;
      if (typeof status === 'number' && status >= 400 && status < 500) {
        throw e;
      }

      attempt++;
      if (attempt >= retries) {
        // Only wrap in RetryError if we actually attempted retries (more than 1 attempt)
        if (attempt > 1) {
          throw new RetryError(attempt, lastError);
        } else {
          // If no retries were attempted, throw the original error
          throw lastError;
        }
      }

      const wait = typeof delay === 'function' ? delay(attempt, e as Error) : delay;
      if (wait !== null && wait !== undefined && wait > 0) {
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }

  // This should never be reached, but if it is, throw RetryError
  throw new RetryError(attempt, lastError ?? new Error('Unexpected retry loop exit'));
}
