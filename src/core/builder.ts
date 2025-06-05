import type { ZodType } from 'zod/v4';

import type { RetryDelay, OutputSchemaOrFn } from '../types/base';
import type { ProcedureConfig } from '../types/config';
import type { ProcedureBuilder } from '../types/core';
import { createCallableProcedure } from './callable';

// Mutable version of ProcedureConfig for builder construction
type MutableProcedureConfig = {
  -readonly [K in keyof ProcedureConfig]: ProcedureConfig[K];
};

export function createProcedureBuilder<TCtx = unknown, TClient = unknown>(
  ctx: TCtx,
  client: TClient
): ProcedureBuilder<TCtx, TClient> {
  // Use a mutable config during construction, then cast to readonly for final use
  const config: MutableProcedureConfig = {
    retryOptions: { retries: 1, delay: 100 },
    ctx,
    client,
  };

  const builder: ProcedureBuilder<TCtx, TClient> = {
    input(schema: ZodType) {
      if (config.inputSchema !== undefined && config.inputSchema !== null) {
        throw new Error('input() can only be called once.');
      }
      config.inputSchema = schema;
      return builder;
    },

    onStart(fn: () => void | Promise<void>) {
      if (config.onStartFn !== undefined && config.onStartFn !== null) {
        throw new Error('onStart() can only be called once.');
      }
      config.onStartFn = fn;
      return builder;
    },

    onSuccess(fn: () => void | Promise<void>) {
      if (config.onSuccessFn !== undefined && config.onSuccessFn !== null) {
        throw new Error('onSuccess() can only be called once.');
      }
      config.onSuccessFn = fn;
      return builder;
    },

    retry(options?: { retries?: number; delay?: RetryDelay }) {
      config.retryOptions = options ?? { retries: 1, delay: 100 };
      return builder;
    },

    handler<TInput, TOutput>(fn: (params: TInput) => Promise<TOutput> | TOutput) {
      if (config.mainHandler !== undefined && config.mainHandler !== null) {
        throw new Error('handler() can only be called once.');
      }
      config.mainHandler = fn as (params: {
        input: unknown;
        ctx: unknown;
        client: unknown;
      }) => Promise<unknown>;
      return builder;
    },

    output<TInput, TOutput>(schemaOrFn: OutputSchemaOrFn<TCtx, TInput, TOutput>) {
      if (config.outputSchemaOrFn !== undefined && config.outputSchemaOrFn !== null) {
        throw new Error('output() can only be called once.');
      }
      config.outputSchemaOrFn = schemaOrFn as OutputSchemaOrFn<unknown, unknown, unknown>;
      return builder;
    },

    transform<TInput, TOutput>(fn: (output: TInput) => Promise<TOutput>) {
      if (config.transformFn !== undefined && config.transformFn !== null) {
        throw new Error('transform() can only be called once.');
      }
      config.transformFn = fn as (output: unknown) => Promise<unknown>;
      return builder;
    },

    onComplete<TResult>(
      fn: (info: {
        readonly result: TResult | null;
        readonly error: Error | null;
        readonly duration: number;
      }) => void | Promise<void>
    ) {
      if (config.onCompleteFn !== undefined && config.onCompleteFn !== null) {
        throw new Error('onComplete() can only be called once.');
      }
      config.onCompleteFn = fn as unknown as (info: {
        isSuccess: boolean;
        isError: boolean;
        input: unknown;
        output: unknown;
        error: Error | undefined;
      }) => void | Promise<void>;
      return builder;
    },

    catchAll<TResult>(fn: (err: Error) => TResult) {
      if (config.catchAllFn !== undefined && config.catchAllFn !== null) {
        throw new Error('catchAll() can only be called once.');
      }
      config.catchAllFn = fn as (err: Error) => unknown;
      return createCallableProcedure<TResult>(config as ProcedureConfig);
    },

    _getCtx: () => ctx,
    _getClient: () => client,
  };

  return builder;
}
