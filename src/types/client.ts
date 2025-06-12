import type {
  RequestConfig,
  HeadersFn,
  GetTokensFn,
  RefreshTokenFn,
  LogErrorFn,
  AddTracingFn,
} from './base';

export interface ClassicHttpClient<Response = unknown> {
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
  request?: (config: RequestConfig) => RequestConfig;
  response?: (response: unknown) => unknown;
  error?: (error: unknown) => unknown;
}

export interface CoreClientParams<Tokens extends Record<string, string> = Record<string, string>> {
  baseURL: string;
  headers?: Record<string, string> | HeadersFn<Tokens>;
  getTokens?: GetTokensFn<Tokens>;
  refreshToken?: RefreshTokenFn;
  logError?: LogErrorFn;
  addTracing?: AddTracingFn;
  timeout?: number;
}

// New interface for fetch client with optional baseURL
export interface FetchClientParams<Tokens extends Record<string, string> = Record<string, string>> {
  baseURL?: string;
  headers?: Record<string, string> | HeadersFn<Tokens>;
  getTokens?: GetTokensFn<Tokens>;
  refreshToken?: RefreshTokenFn;
  logError?: LogErrorFn;
  addTracing?: AddTracingFn;
  timeout?: number;
}
