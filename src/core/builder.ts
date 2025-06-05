import type { ZodType } from 'zod/v4';

import type { RetryDelay } from '../types/base';
import type { ProcedureConfig } from '../types/config';
import type { ProcedureBuilder } from '../types/core';
import { createCallableProcedure } from './callable';

export function createProcedureBuilder(ctx: any, client: any): ProcedureBuilder {
  const config: ProcedureConfig = {
    retryOptions: { retries: 1, delay: 100 },
    ctx,
    client,
  };

  const builder: ProcedureBuilder = {
    input(schema: ZodType) {
      if (config.inputSchema) {
        throw new Error('input() can only be called once.');
      }
      config.inputSchema = schema;
      return builder;
    },

    onStart(fn: () => void | Promise<void>) {
      if (config.onStartFn) {
        throw new Error('onStart() can only be called once.');
      }
      config.onStartFn = fn;
      return builder;
    },

    onSuccess(fn: () => void | Promise<void>) {
      if (config.onSuccessFn) {
        throw new Error('onSuccess() can only be called once.');
      }
      config.onSuccessFn = fn;
      return builder;
    },

    retry(options?: { retries?: number; delay?: RetryDelay }) {
      config.retryOptions = options ?? { retries: 1, delay: 100 };
      return builder;
    },

    handler(fn: (params: any) => Promise<any> | any) {
      if (config.mainHandler) {
        throw new Error('handler() can only be called once.');
      }
      config.mainHandler = fn;
      return builder;
    },

    output(schemaOrFn: any) {
      if (config.outputSchemaOrFn) {
        throw new Error('output() can only be called once.');
      }
      config.outputSchemaOrFn = schemaOrFn;
      return builder;
    },

    transform(fn: (output: any) => any | Promise<any>) {
      if (config.transformFn) {
        throw new Error('transform() can only be called once.');
      }
      config.transformFn = fn;
      return builder;
    },

    onComplete(fn: (info: any) => void | Promise<void>) {
      if (config.onCompleteFn) {
        throw new Error('onComplete() can only be called once.');
      }
      config.onCompleteFn = fn;
      return builder;
    },

    catchAll(fn: (err: any) => any) {
      if (config.catchAllFn) {
        throw new Error('catchAll() can only be called once.');
      }
      config.catchAllFn = fn;
      return createCallableProcedure(config);
    },

    _getCtx: () => ctx,
    _getClient: () => client,
  };

  return builder;
}
