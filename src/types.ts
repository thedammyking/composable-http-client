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

export interface ClassicHttpClient<Response = any> {
  request: (config?: RequestConfig) => Promise<Response>;
  get: <T = Response>(url: string, config?: RequestConfig) => Promise<T>;
  post: <T = Response>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>;
  put: <T = Response>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>;
  patch: <T = Response>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>;
  delete: <T = Response>(url: string, config?: RequestConfig) => Promise<T>;
  head: <T = Response>(url: string, config?: RequestConfig) => Promise<T>;
  options: <T = Response>(url: string, config?: RequestConfig) => Promise<T>;
  getUri: (config?: { url?: string }) => Promise<string>;
}

export interface Interceptors {
  request?: (config: any) => any;
  response?: (response: any) => any;
  error?: (error: unknown) => unknown;
}

export type CoreClientParams<Tokens extends Record<string, string> = Record<string, string>> = {
  baseURL: string;
  headers?: Record<string, string> | HeadersFn<Tokens>;
  getTokens?: GetTokensFn<Tokens>;
  refreshToken?: RefreshTokenFn;
  logError?: LogErrorFn;
  addTracing?: AddTracingFn;
  timeout?: number;
};

export type FetchLike = typeof fetch;

export type RetryDelay = number | ((currentAttempt: number, err: any) => number);
export type Result<T> = { result: T | null; error: any | null };

export type OutputSchemaOrFn<TCtx, TInput, TOutput> =
  | ZodType
  | ((args: { ctx: TCtx; input: TInput; output: TOutput }) => ZodType);
