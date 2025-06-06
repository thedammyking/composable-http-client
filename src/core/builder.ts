import type { $ZodType } from 'zod/v4/core';

import type { RetryDelay, OutputSchemaOrFn } from '../types/base';
import type { ProcedureConfig } from '../types/config';
import type { ProcedureBuilder } from '../types/core';
import { createCallableProcedure } from './callable';
import { addInternalAccess } from './internal-symbols';

// Mutable version of ProcedureConfig for builder construction
type MutableProcedureConfig = {
  -readonly [K in keyof ProcedureConfig]: ProcedureConfig[K];
};

export function createProcedureBuilder<TCtx = unknown, TClient = unknown>(
  ctx: TCtx,
  client: TClient
): ProcedureBuilder<TCtx, TClient, unknown, unknown> {
  // Use a mutable config during construction, then cast to readonly for final use
  const config: MutableProcedureConfig = {
    retryOptions: { retries: 1, delay: 100 },
    ctx,
    client,
  };

  // Create the callable function that can be used without catchAll
  const callableWithoutCatchAll = async (input: unknown) => {
    return createCallableProcedure<unknown, Error>(config as ProcedureConfig)(input);
  };

  const builderBase = Object.assign(callableWithoutCatchAll, {
    input<TInputSchema extends $ZodType>(schema: TInputSchema) {
      if (config.inputSchema !== undefined && config.inputSchema !== null) {
        throw new Error('input() can only be called once.');
      }
      config.inputSchema = schema;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
      return builder as any;
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

    handler<THandlerOutput>(
      fn: (params: {
        readonly input: unknown;
        readonly ctx: TCtx;
        readonly client: TClient;
      }) => Promise<THandlerOutput> | THandlerOutput
    ) {
      if (config.mainHandler !== undefined && config.mainHandler !== null) {
        throw new Error('handler() can only be called once.');
      }
      config.mainHandler = fn as (params: {
        input: unknown;
        ctx: unknown;
        client: unknown;
      }) => Promise<unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
      return builder as any;
    },

    output<TOutputSchema extends OutputSchemaOrFn<TCtx, unknown, unknown>>(
      schemaOrFn: TOutputSchema
    ) {
      if (config.outputSchemaOrFn !== undefined && config.outputSchemaOrFn !== null) {
        throw new Error('output() can only be called once.');
      }
      config.outputSchemaOrFn = schemaOrFn as OutputSchemaOrFn<unknown, unknown, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
      return builder as any;
    },

    transform<TResponse = unknown>(fn: (response: TResponse) => any) {
      if (config.transformFn !== undefined && config.transformFn !== null) {
        throw new Error('transform() can only be called once.');
      }
      config.transformFn = fn as (output: unknown) => Promise<unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
      return builder as any;
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

    catchAll<TError>(fn: (err: Error) => TError) {
      if (config.catchAllFn !== undefined && config.catchAllFn !== null) {
        throw new Error('catchAll() can only be called once.');
      }
      config.catchAllFn = fn as (err: Error) => unknown;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
      return createCallableProcedure<unknown, TError>(config as ProcedureConfig) as any;
    },
  });

  // Add internal symbol-based access methods using type-safe helper
  const builder = addInternalAccess(builderBase, ctx, client);

  return builder;
}
