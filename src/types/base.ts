import type { ZodType } from 'zod/v4';

export type GetTokensFn<Tokens extends Record<string, string> = Record<string, string>> =
  () => Tokens;

export type HeadersFn<Tokens extends Record<string, string> = Record<string, string>> = (
  tokens: Tokens
) => Record<string, string>;

export type LogErrorFn = (error: unknown) => Promise<void>;

export type AddTracingFn = (context: {
  readonly method: string;
  readonly url: string;
  readonly config: unknown;
}) => Promise<void>;

export type RefreshTokenFn = () => Promise<void>;

export interface RequestConfig {
  readonly url?: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly data?: unknown;
  readonly timeout?: number;
  readonly [key: string]: unknown;
}

export type FetchLike = typeof fetch;

export type RetryDelay = number | ((currentAttempt: number, err: Error) => number);

export interface Result<T> {
  readonly data: T | null;
  readonly error: Error | null;
}

export type OutputSchemaOrFn<TCtx, TInput, TOutput> =
  | ZodType
  | ((args: { readonly ctx: TCtx; readonly input: TInput; readonly output: TOutput }) => ZodType);
