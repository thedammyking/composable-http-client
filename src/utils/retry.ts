import type { RetryDelay } from '../types/base';

export async function retry<T>(
  fn: () => Promise<T>,
  options?: { retries?: number; delay?: RetryDelay }
): Promise<T> {
  const { retries = 1, delay = 100 } = options ?? {};
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (e: unknown) {
      const error = e as { response?: { status?: number }; status?: number };
      const status = error?.response?.status ?? error?.status ?? undefined;
      if (typeof status === 'number' && status >= 400 && status < 500) {
        throw e;
      }

      attempt++;
      if (attempt >= retries) {
        throw e;
      }

      const wait = typeof delay === 'function' ? delay(attempt, e as Error) : delay;
      if (wait !== null && wait !== undefined && wait > 0) {
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }

  throw new Error('Unexpected retry loop exit');
}
