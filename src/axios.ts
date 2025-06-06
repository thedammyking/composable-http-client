import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

import type { ClassicHttpClient, CoreClientParams, Interceptors } from './types';
import { buildClassicHttpClient, resolveHeaders } from './utils';
import { HttpError, TimeoutError, NetworkError, TokenRefreshError } from './errors';

// Type guard for axios errors - provides type-safe error checking
function isAxiosError(
  error: unknown
): error is { response?: { status?: number }; status?: number } {
  return error !== null && typeof error === 'object' && ('response' in error || 'status' in error);
}

export function createHttpClient<
  Tokens extends Record<string, string> = Record<string, string>,
  Response = unknown,
>({
  baseURL,
  headers,
  interceptors,
  getTokens,
  refreshToken,
  logError,
  addTracing,
  timeout = 0, // Default is unlimited
}: CoreClientParams<Tokens> & { interceptors?: Interceptors }): ClassicHttpClient<Response> {
  const instance: AxiosInstance = axios.create({ baseURL, timeout });

  if (interceptors?.request !== undefined && interceptors?.request !== null) {
    // Using 'any' due to axios's complex internal type requirements
    // The Interceptors interface provides type safety at the API boundary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    instance.interceptors.request.use(interceptors.request as any, interceptors.error);
  }
  if (interceptors?.response !== undefined && interceptors?.response !== null) {
    // Using 'any' due to axios's complex internal type requirements
    // The Interceptors interface provides type safety at the API boundary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    instance.interceptors.response.use(interceptors.response as any, interceptors.error);
  }

  async function coreRequest<T = Response>(
    config: AxiosRequestConfig = {},
    retry = false
  ): Promise<T> {
    try {
      if (addTracing !== undefined && addTracing !== null)
        await addTracing({ method: config.method ?? 'get', url: config.url ?? '', config });
      const tokens = getTokens !== undefined && getTokens !== null ? getTokens() : ({} as Tokens);
      const newHeaders = resolveHeaders(headers, tokens);
      config.headers = { ...config.headers, ...newHeaders };
      const res: AxiosResponse<T> = await instance.request<T>(config);
      return res.data;
    } catch (error: unknown) {
      if (logError !== undefined && logError !== null) await logError(error);

      // Handle axios-specific errors and convert them to our error types
      if (axios.isAxiosError(error)) {
        // Network errors (no response)
        if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
          const timeout = config.timeout ?? 5000;
          throw new TimeoutError(timeout);
        }

        if (error.code === 'ERR_NETWORK' || error.response === undefined) {
          throw new NetworkError('Network request failed', error);
        }

        // HTTP errors (with response)
        if (error.response !== undefined && error.response !== null) {
          const { status, data, headers } = error.response;
          const headersObj: Record<string, string> = {};
          if (headers !== undefined && headers !== null) {
            Object.entries(headers).forEach(([key, value]) => {
              headersObj[key] = String(value);
            });
          }

          if (status === 401 && refreshToken !== undefined && refreshToken !== null && !retry) {
            try {
              await refreshToken();
              return coreRequest<T>(config, true);
            } catch (refreshError) {
              throw new TokenRefreshError('Token refresh failed', refreshError as Error);
            }
          }

          throw new HttpError(`Request failed with status ${status}`, status, data, headersObj);
        }
      }

      // Type-safe error handling for backward compatibility
      if (isAxiosError(error)) {
        const is401 = error.response?.status === 401 || error.status === 401;
        if (is401 && refreshToken !== undefined && refreshToken !== null && !retry) {
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
  }

  return buildClassicHttpClient<Response>(baseURL, coreRequest);
}
