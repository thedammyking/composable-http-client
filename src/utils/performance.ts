import type { Memoized } from '../types/utility';

/**
 * Performance optimization utilities with type safety
 */

/**
 * Creates a memoized version of a function with type-safe cache management
 */
export function memoize<T extends (...args: readonly unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): Memoized<T> {
  const cache = new Map<string, ReturnType<T>>();

  const defaultKeyGenerator = (...args: Parameters<T>): string => {
    return JSON.stringify(args);
  };

  const generateKey = keyGenerator ?? defaultKeyGenerator;

  const memoizedFn = ((...args: Parameters<T>): ReturnType<T> => {
    const key = generateKey(...args);

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);

    return result;
  }) as T;

  // Add cache management methods using Object.assign to avoid readonly issues
  const memoizedWithCache = Object.assign(memoizedFn, {
    cache,
    clear: () => cache.clear(),
  }) as Memoized<T>;

  return memoizedWithCache;
}

/**
 * Debounce function with type safety
 */
export function debounce<T extends (...args: readonly unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Throttle function with type safety
 */
export function throttle<T extends (...args: readonly unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>): void => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Batch operations for better performance
 */
export class BatchProcessor<T, R> {
  private readonly batch: T[] = [];
  private readonly batchSize: number;
  private readonly processor: (items: readonly T[]) => Promise<readonly R[]>;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly flushDelay: number;

  constructor(
    processor: (items: readonly T[]) => Promise<readonly R[]>,
    options: {
      readonly batchSize?: number;
      readonly flushDelay?: number;
    } = {}
  ) {
    this.processor = processor;
    this.batchSize = options.batchSize ?? 10;
    this.flushDelay = options.flushDelay ?? 100;
  }

  add(item: T): Promise<readonly R[]> {
    this.batch.push(item);

    // Auto-flush if batch size reached
    if (this.batch.length >= this.batchSize) {
      return this.flush();
    }

    // Schedule flush if not already scheduled
    if (this.timeoutId === null) {
      return new Promise(resolve => {
        this.timeoutId = setTimeout(() => {
          this.flush().then(resolve).catch(resolve);
        }, this.flushDelay);
      });
    }

    // Return pending flush promise
    return new Promise(resolve => {
      const checkFlush = (): void => {
        if (this.batch.length === 0) {
          resolve([]);
        } else {
          setTimeout(checkFlush, 10);
        }
      };
      checkFlush();
    });
  }

  async flush(): Promise<readonly R[]> {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.batch.length === 0) {
      return [];
    }

    const items = [...this.batch];
    this.batch.length = 0;

    return this.processor(items);
  }
}

/**
 * LRU Cache with type safety
 */
export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly cache = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);

    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }

    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
