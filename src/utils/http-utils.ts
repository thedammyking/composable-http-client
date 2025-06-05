import type { HeadersFn, RequestConfig } from '../types/base';
import type { ClassicHttpClient } from '../types/client';

export function buildUrl(baseURL: string, url: string = ''): string {
  return [baseURL.replace(/\/$/, ''), url.replace(/^\//, '')].filter(Boolean).join('/');
}

export function resolveHeaders<Tokens extends Record<string, string>>(
  headers: Record<string, string> | HeadersFn<Tokens> | undefined,
  tokens: Tokens
): Record<string, string> {
  return typeof headers === 'function' ? headers(tokens) : (headers ?? {});
}

export function buildClassicHttpClient<Response = unknown>(
  baseURL: string,
  coreRequest: <T = Response>(config: RequestConfig, retry?: boolean) => Promise<T>
): ClassicHttpClient<Response> {
  return {
    request: config => coreRequest({ ...config }),
    get: (url, config = {}) => coreRequest({ ...config, url, method: 'get' }),
    post: (url, data, config = {}) => coreRequest({ ...config, url, data, method: 'post' }),
    put: (url, data, config = {}) => coreRequest({ ...config, url, data, method: 'put' }),
    patch: (url, data, config = {}) => coreRequest({ ...config, url, data, method: 'patch' }),
    delete: (url, config = {}) => coreRequest({ ...config, url, method: 'delete' }),
    head: (url, config = {}) => coreRequest({ ...config, url, method: 'head' }),
    options: (url, config = {}) => coreRequest({ ...config, url, method: 'options' }),
    getUri: async (config = {}) => buildUrl(baseURL, config.url ?? ''),
  };
}
