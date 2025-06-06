import type { ClassicHttpClient, CoreClientParams, FetchLike, RequestConfig } from './types';
import { buildClassicHttpClient, buildUrl, resolveHeaders } from './utils';

function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  if (timeout === 0 || timeout === null || timeout === undefined) return promise; // 0 or falsy means unlimited, no timer
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timeout')), timeout);
    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function createFetchCoreRequest<
  Tokens extends Record<string, string> = Record<string, string>,
  Response = unknown,
  Fetch extends FetchLike = FetchLike,
>(
  fetchImpl: Fetch,
  {
    baseURL,
    headers,
    getTokens,
    refreshToken,
    logError,
    addTracing,
    timeout = 0,
  }: CoreClientParams<Tokens>
) {
  return async function coreRequest<T = Response>(
    config: RequestConfig = {},
    retry = false
  ): Promise<T> {
    const method = (config.method ?? 'get').toUpperCase();
    const url = buildUrl(baseURL, config.url ?? '');
    if (addTracing !== undefined && addTracing !== null) await addTracing({ method, url, config });
    const tokens = getTokens !== undefined && getTokens !== null ? getTokens() : ({} as Tokens);
    const reqHeaders: Record<string, string> = {
      ...resolveHeaders(headers, tokens),
      ...config.headers,
    };
    const fetchOptions: RequestInit = {
      method,
      headers: reqHeaders,
      body: config.data !== undefined && config.data !== null ? JSON.stringify(config.data) : null,
    };

    try {
      const fetchPromise = fetchImpl(url, fetchOptions).then(async res => {
        const contentType = res.headers.get('content-type') ?? '';
        let body: unknown;
        if (contentType.includes('json')) {
          body = await res.json();
        } else {
          body = await res.text();
        }
        if (!res.ok) {
          const error = new Error('Request failed');
          (error as { response?: { status: number; data: unknown } }).response = {
            status: res.status,
            data: body,
          };
          throw error;
        }
        return body as T;
      });
      return await withTimeout<T>(fetchPromise, config.timeout ?? timeout);
    } catch (error: unknown) {
      if (logError !== undefined && logError !== null) await logError(error);
      const errorWithResponse = error as { response?: { status?: number } };
      if (
        errorWithResponse.response?.status === 401 &&
        refreshToken !== undefined &&
        refreshToken !== null &&
        !retry
      ) {
        await refreshToken();
        return coreRequest<T>(config, true);
      }
      throw error;
    }
  };
}

export function createHttpClient<
  Tokens extends Record<string, string> = Record<string, string>,
  Response = unknown,
>(params: CoreClientParams<Tokens>): ClassicHttpClient<Response> {
  const coreRequest = createFetchCoreRequest<Tokens, Response>(fetch, params);
  return buildClassicHttpClient<Response>(params.baseURL, coreRequest);
}
