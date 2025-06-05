import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

import type { ClassicHttpClient, CoreClientParams, Interceptors } from './types';
import { buildClassicHttpClient, resolveHeaders } from './utils';

export function createHttpClient<
  Tokens extends Record<string, string> = Record<string, string>,
  Response = AxiosResponse,
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

  if (interceptors?.request) {
    instance.interceptors.request.use(interceptors.request, interceptors.error);
  }
  if (interceptors?.response) {
    instance.interceptors.response.use(interceptors.response, interceptors.error);
  }

  async function coreRequest<T = Response>(
    config: AxiosRequestConfig = {},
    retry = false
  ): Promise<T> {
    try {
      if (addTracing)
        await addTracing({ method: config.method ?? 'get', url: config.url ?? '', config });
      const tokens = getTokens ? getTokens() : ({} as Tokens);
      const newHeaders = resolveHeaders(headers, tokens);
      config.headers = { ...config.headers, ...newHeaders };
      const res: AxiosResponse<T> = await instance.request<T>(config);
      return res.data;
    } catch (error: any) {
      if (logError) await logError(error);
      // Check both error.response.status and error.status for 401
      const is401 = error.response?.status === 401 || error.status === 401;
      if (is401 && refreshToken && !retry) {
        await refreshToken();
        return coreRequest<T>(config, true);
      }
      throw error;
    }
  }

  return buildClassicHttpClient<Response>(baseURL, coreRequest);
}
