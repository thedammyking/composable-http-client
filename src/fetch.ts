import type { ClassicHttpClient, FetchClientParams, FetchLike, RequestConfig } from './types';
import { HttpError, TimeoutError, NetworkError, TokenRefreshError } from './errors';
import { buildClassicHttpClient, buildUrl, resolveHeaders } from './utils';

function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  if (timeout === 0 || timeout === null || timeout === undefined) return promise; // 0 or falsy means unlimited, no timer
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(timeout)), timeout);
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

// Type guard for fetch errors
function isFetchError(error: unknown): error is { response?: { status?: number } } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'response' in error &&
    error.response !== null &&
    typeof error.response === 'object' &&
    'status' in error.response
  );
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
  }: FetchClientParams<Tokens>
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
          const headersObj: Record<string, string> = {};
          res.headers.forEach((value, key) => {
            headersObj[key] = value;
          });
          throw new HttpError('Request failed', res.status, body, headersObj);
        }
        // Note: This cast is unavoidable as we cannot validate response shape at runtime
        // without a schema. Consider using .output() with zod validation in procedures.
        return body as T;
      });
      return await withTimeout<T>(fetchPromise, config.timeout ?? timeout);
    } catch (error: unknown) {
      if (logError !== undefined && logError !== null) await logError(error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network request failed', error);
      }

      // Type-safe error handling using type guard
      if (isFetchError(error)) {
        if (
          error.response?.status === 401 &&
          refreshToken !== undefined &&
          refreshToken !== null &&
          !retry
        ) {
          try {
            await refreshToken();
            return coreRequest<T>(config, true);
          } catch (refreshError) {
            throw new TokenRefreshError('Token refresh failed', refreshError as Error);
          }
        }
      }
      throw error;
    }
  };
}

export function createHttpClient<
  Tokens extends Record<string, string> = Record<string, string>,
  Response = unknown,
>(params?: FetchClientParams<Tokens>): ClassicHttpClient<Response> {
  // Note: When baseURL is not provided, URLs are passed directly to fetch().
  // In browser/Next.js environments, relative URLs like '/api/users' work fine
  // as they resolve against the current page URL.
  // In Node.js environments, you'll need to provide absolute URLs.
  const safeParams = params ?? {};
  const coreRequest = createFetchCoreRequest<Tokens, Response>(fetch, safeParams);
  return buildClassicHttpClient<Response>(safeParams.baseURL, coreRequest);
}
