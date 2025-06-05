import type {
  RequestConfig,
  HeadersFn,
  GetTokensFn,
  RefreshTokenFn,
  LogErrorFn,
  AddTracingFn,
} from './base';

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
