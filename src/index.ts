import type { ZodType } from 'zod/v4';

import type { ClassicHttpClient, Result, RetryDelay } from './types';

// --- Simple configuration ---
interface ProcedureConfig {
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

// --- Simple interfaces ---
export interface ProcedureBuilder<TCtx = any, TClient = any> {
  input(schema: ZodType): ProcedureBuilder<TCtx, TClient>;
  onStart(fn: () => void | Promise<void>): ProcedureBuilder<TCtx, TClient>;
  onSuccess(fn: () => void | Promise<void>): ProcedureBuilder<TCtx, TClient>;
  retry(options?: { retries?: number; delay?: RetryDelay }): ProcedureBuilder<TCtx, TClient>;
  handler(fn: (params: any) => Promise<any> | any): ProcedureBuilder<TCtx, TClient>;
  output(schemaOrFn: any): ProcedureBuilder<TCtx, TClient>;
  transform(fn: (output: any) => any | Promise<any>): ProcedureBuilder<TCtx, TClient>;
  onComplete(fn: (info: any) => void | Promise<void>): ProcedureBuilder<TCtx, TClient>;
  catchAll(fn: (err: any) => any): CallableProcedure<any>;
  _getCtx(): TCtx;
  _getClient(): TClient;
}

export interface CallableProcedure<TResult = any> {
  (input: any): Promise<Result<TResult>>;
}

export type BaseProcedure<TCtx = any, TClient = any> = {
  (): ProcedureBuilder<TCtx, TClient>;
  _getCtx(): TCtx;
  _getClient(): TClient;
};

export type HttpClientProcedureBuilder<TClient = any> = {
  (): ProcedureBuilder<null, TClient>;
  handler(ctxHandler: () => any): HttpClientProcedureBuilderWithHandler<TClient>;
  _getCtx(): null;
  _getClient(): TClient;
};

export type HttpClientProcedureBuilderWithHandler<TClient = any> = {
  (): ProcedureBuilder<any, TClient>;
  catch(creationErrorHandler: (err: Error) => any): HttpClientProcedureBuilderWithHandler<TClient>;
  _getCtx(): any;
  _getClient(): TClient;
};

export type ExtendedProcedureBuilder<TClient = any> = {
  handler(
    ctxHandler: (args: { ctx: any; client: TClient }) => any
  ): ExtendedProcedureBuilderWithHandler<TClient>;
};

export type ExtendedProcedureBuilderWithHandler<TClient = any> = {
  (): ProcedureBuilder<any, TClient>;
  catch(creationErrorHandler: (err: Error) => any): ExtendedProcedureBuilderWithHandler<TClient>;
  _getCtx(): any;
  _getClient(): TClient;
};

// --- Retry helper ---
async function retry<T>(
  fn: () => Promise<T>,
  options?: { retries?: number; delay?: RetryDelay }
): Promise<T> {
  const { retries = 1, delay = 100 } = options ?? {};
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status ?? undefined;
      if (typeof status === 'number' && status >= 400 && status < 500) {
        throw e;
      }

      attempt++;
      if (attempt >= retries) {
        throw e;
      }

      const wait = typeof delay === 'function' ? delay(attempt, e) : delay;
      if (wait && wait > 0) {
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }

  throw new Error('Unexpected retry loop exit');
}

// --- Helper functions ---
function validateConfig(config: ProcedureConfig): void {
  if (!config.mainHandler) {
    throw new Error(
      'Main handler is required. Call .handler() before making the procedure callable.'
    );
  }
}

async function executeLifecycleHook(
  hookFn: (() => void | Promise<void>) | undefined,
  hookName: string
): Promise<void> {
  if (!hookFn) return;

  try {
    await hookFn();
  } catch (error) {
    throw new Error(
      `Error in ${hookName} hook: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function processInput(input: any, inputSchema?: ZodType): Promise<any> {
  if (!inputSchema) return input;

  try {
    return inputSchema.parse(input);
  } catch (error) {
    throw new Error(
      `Input validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function processOutput(
  output: any,
  outputSchemaOrFn: any,
  ctx: any,
  input: any
): Promise<any> {
  if (!outputSchemaOrFn) return output;

  try {
    if (typeof outputSchemaOrFn === 'function') {
      const schema = outputSchemaOrFn({ ctx, input, output });
      return schema.parse(output);
    } else {
      return outputSchemaOrFn.parse(output);
    }
  } catch (error) {
    throw new Error(
      `Output validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// --- Create HTTP client procedure ---
export function createHttpClientProcedure<TClient extends ClassicHttpClient>(
  client: TClient
): HttpClientProcedureBuilder<TClient> {
  const baseProcedureFactory = () => createProcedure(null, client);

  const builder: HttpClientProcedureBuilder<TClient> = Object.assign(baseProcedureFactory, {
    handler(ctxHandler: () => any): HttpClientProcedureBuilderWithHandler<TClient> {
      let ctx: any;
      let creationError: Error | null = null;

      try {
        ctx = ctxHandler();
      } catch (err) {
        creationError = err instanceof Error ? err : new Error(String(err));
      }

      const procedureFactory = () => createProcedure(ctx, client);

      const withHandlerBuilder: HttpClientProcedureBuilderWithHandler<TClient> = Object.assign(
        procedureFactory,
        {
          catch(
            creationErrorHandler: (err: Error) => any
          ): HttpClientProcedureBuilderWithHandler<TClient> {
            if (creationError) {
              try {
                ctx = creationErrorHandler(creationError);
              } catch (catchError) {
                throw catchError;
              }
            }

            const newProcedureFactory = () => createProcedure(ctx, client);
            return Object.assign(newProcedureFactory, {
              catch() {
                throw new Error('catch() can only be called once.');
              },
              _getCtx: () => ctx,
              _getClient: () => client,
            });
          },
          _getCtx: () => ctx,
          _getClient: () => client,
        }
      );

      if (creationError) {
        throw creationError;
      }

      return withHandlerBuilder;
    },
    _getCtx: () => null,
    _getClient: () => client,
  });

  return builder;
}

// --- Core procedure builder ---
function createProcedure(ctx: any, client: any): ProcedureBuilder {
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

// --- Create callable procedure ---
function createCallableProcedure(config: ProcedureConfig): CallableProcedure {
  validateConfig(config);

  const callable = async (input: any): Promise<Result<any>> => {
    let parsedInput: any = input;
    let output: any;
    let error: any = null;

    try {
      await executeLifecycleHook(config.onStartFn, 'onStart');
      parsedInput = await processInput(input, config.inputSchema);
      output = await retry(
        () => config.mainHandler!({ input: parsedInput, ctx: config.ctx, client: config.client }),
        config.retryOptions
      );
      output = await processOutput(output, config.outputSchemaOrFn, config.ctx, parsedInput);

      if (config.transformFn) {
        output = await config.transformFn(output);
      }

      await executeLifecycleHook(config.onSuccessFn, 'onSuccess');

      if (config.onCompleteFn) {
        await config.onCompleteFn({
          isSuccess: true,
          isError: false,
          input: parsedInput,
          output,
          error: undefined,
        });
      }

      return { result: output, error: null };
    } catch (e) {
      error = e;

      if (config.onCompleteFn) {
        try {
          await config.onCompleteFn({
            isSuccess: false,
            isError: true,
            input: parsedInput,
            output,
            error,
          });
        } catch (completeError) {
          console.warn('Error in onComplete hook:', completeError);
        }
      }

      const finalError = config.catchAllFn ? config.catchAllFn(error) : error;
      return { result: null, error: finalError };
    }
  };

  return callable as CallableProcedure;
}

// --- Extend procedure ---
export function extendProcedure<TBaseProcedure extends BaseProcedure>(
  baseProcedure: TBaseProcedure
): ExtendedProcedureBuilder<ReturnType<TBaseProcedure['_getClient']>> {
  return {
    handler(
      ctxHandler: (args: { ctx: any; client: any }) => any
    ): ExtendedProcedureBuilderWithHandler {
      let ctx: any;
      let creationError: Error | null = null;

      try {
        ctx = ctxHandler({
          ctx: baseProcedure._getCtx(),
          client: baseProcedure._getClient(),
        });
      } catch (err) {
        creationError = err instanceof Error ? err : new Error(String(err));
      }

      const procedureFactory = () => createProcedure(ctx, baseProcedure._getClient());

      const withHandlerBuilder: ExtendedProcedureBuilderWithHandler = Object.assign(
        procedureFactory,
        {
          catch(creationErrorHandler: (err: Error) => any): ExtendedProcedureBuilderWithHandler {
            if (creationError) {
              try {
                ctx = creationErrorHandler(creationError);
              } catch (catchError) {
                throw catchError;
              }
            }

            const newProcedureFactory = () => createProcedure(ctx, baseProcedure._getClient());
            return Object.assign(newProcedureFactory, {
              catch() {
                throw new Error('catch() can only be called once.');
              },
              _getCtx: () => ctx,
              _getClient: () => baseProcedure._getClient(),
            });
          },
          _getCtx: () => ctx,
          _getClient: () => baseProcedure._getClient(),
        }
      );

      if (creationError) {
        throw creationError;
      }

      return withHandlerBuilder;
    },
  };
}
