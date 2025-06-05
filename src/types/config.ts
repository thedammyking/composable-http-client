import type { $ZodType } from 'zod/v4/core';

import type { RetryDelay, OutputSchemaOrFn } from './base';

export interface ProcedureConfig {
  readonly inputSchema?: $ZodType;
  readonly outputSchemaOrFn?: OutputSchemaOrFn<unknown, unknown, unknown>;
  readonly retryOptions: { readonly retries?: number; readonly delay?: RetryDelay };
  readonly transformFn?: (output: unknown) => Promise<unknown>;
  readonly catchAllFn?: (err: Error) => unknown;
  readonly onStartFn?: () => void | Promise<void>;
  readonly onSuccessFn?: () => void | Promise<void>;
  readonly onCompleteFn?: (info: {
    readonly isSuccess: boolean;
    readonly isError: boolean;
    readonly input: unknown;
    readonly output: unknown;
    readonly error: Error | undefined;
  }) => void | Promise<void>;
  readonly mainHandler?: (params: {
    readonly input: unknown;
    readonly ctx: unknown;
    readonly client: unknown;
  }) => Promise<unknown>;
  readonly ctx: unknown;
  readonly client: unknown;
}
