import type { ZodType } from 'zod/v4';

import type { RetryDelay } from './base';

export interface ProcedureConfig {
  inputSchema?: ZodType;
  outputSchemaOrFn?: any;
  retryOptions: { retries?: number; delay?: RetryDelay };
  transformFn?: (output: any) => any | Promise<any>;
  catchAllFn?: (err: any) => any;
  onStartFn?: () => void | Promise<void>;
  onSuccessFn?: () => void | Promise<void>;
  onCompleteFn?: (info: any) => void | Promise<void>;
  mainHandler?: (params: any) => Promise<any> | any;
  ctx: any;
  client: any;
}
