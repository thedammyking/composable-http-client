import type { ZodType } from 'zod/v4';

export type GetTokensFn<Tokens extends Record<string, string> = Record<string, string>> =
  () => Tokens;

export type HeadersFn<Tokens extends Record<string, string> = Record<string, string>> = (
  tokens: Tokens
) => Record<string, string>;

export type LogErrorFn = (error: unknown) => Promise<void>;

export type AddTracingFn = (context: {
  method: string;
  url: string;
  config: unknown;
}) => Promise<void>;

export type RefreshTokenFn = () => Promise<void>;

export interface RequestConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
  [key: string]: unknown;
}

export type FetchLike = typeof fetch;

export type RetryDelay = number | ((currentAttempt: number, err: any) => number);
export type Result<T> = { result: T | null; error: any | null };

export type OutputSchemaOrFn<TCtx, TInput, TOutput> =
  | ZodType
  | ((args: { ctx: TCtx; input: TInput; output: TOutput }) => ZodType);
