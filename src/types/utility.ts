/**
 * Utility types for enhanced type safety
 */

/**
 * Makes all properties readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Makes specific keys required while keeping others optional
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Removes null and undefined from a type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Creates a type that excludes specific keys
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Ensures a type is not any
 */
export type NoAny<T> = 0 extends 1 & T ? never : T;

/**
 * Helper type for function parameters
 */
export type Parameters<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

/**
 * Helper type for function return types
 */
export type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: unknown[]
) => infer R
  ? R
  : unknown;

/**
 * Branded type for creating nominal types
 */
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * Safe array access that returns T | undefined
 */
export type SafeArrayAccess<T extends readonly unknown[]> =
  T extends ReadonlyArray<infer U> ? U | undefined : never;

/**
 * Ensures all properties are defined (no optional properties)
 */
export type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : T[P] | undefined;
};

/**
 * Type predicate helper
 */
export type TypePredicate<T> = (value: unknown) => value is T;

// Type Guards for Runtime Type Checking
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is readonly T[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is (...args: readonly unknown[]) => unknown {
  return typeof value === 'function';
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// Branded Types for Nominal Typing
export type URL = Brand<string, 'URL'>;
export type HTTPMethod = Brand<string, 'HTTPMethod'>;
export type StatusCode = Brand<number, 'StatusCode'>;
export type Timeout = Brand<number, 'Timeout'>;

// Advanced Utility Types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type StrictExtract<T, U> = T extends U ? T : never;

export type NonEmptyArray<T> = readonly [T, ...(readonly T[])];

export type RequiredKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EmptyObject {}

// Type-safe event system
export type EventMap = Readonly<Record<string, readonly unknown[]>>;

export type EventHandler<T extends readonly unknown[]> = (...args: T) => void | Promise<void>;

export interface TypedEventEmitter<T extends EventMap> {
  readonly on: <K extends keyof T>(event: K, handler: EventHandler<T[K]>) => void;
  readonly off: <K extends keyof T>(event: K, handler: EventHandler<T[K]>) => void;
  readonly emit: <K extends keyof T>(event: K, ...args: T[K]) => void;
}

// Result type with comprehensive error handling
export type AsyncResult<T, E = Error> = Promise<
  { readonly success: true; readonly data: T } | { readonly success: false; readonly error: E }
>;

// Type-safe configuration builder
export type ConfigBuilder<T> = {
  readonly [K in keyof T]: (value: T[K]) => ConfigBuilder<T>;
} & {
  readonly build: () => T;
};

// Performance optimization types
export type Memoized<T extends (...args: readonly unknown[]) => unknown> = T & {
  readonly cache: Map<string, ReturnType<T>>;
  readonly clear: () => void;
};

// Type-level validation
export type ValidateConfig<T> = T extends {
  readonly url: string;
  readonly method: HTTPMethod;
}
  ? T
  : never;
