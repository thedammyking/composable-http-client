import type { Result } from '../types/base';
import type { ProcedureConfig } from '../types/config';
import type { CallableProcedure } from '../types/core';
import { retry } from '../utils/retry';
import { validateConfig, executeLifecycleHook } from '../utils/validation';
import { processInput, processOutput } from '../utils/processors';

export function createCallableProcedure<TData = unknown, TError = Error>(
  config: ProcedureConfig
): CallableProcedure<TData, TError> {
  validateConfig(config);

  const callable = async (input: unknown): Promise<Result<TData, TError>> => {
    let parsedInput: unknown = input;
    let output: unknown;
    let error: Error | null = null;

    try {
      await executeLifecycleHook(config.onStartFn, 'onStart');
      parsedInput = await processInput(input, config.inputSchema);

      if (config.mainHandler === undefined || config.mainHandler === null) {
        throw new Error('Main handler is not defined');
      }

      output = await retry(
        () =>
          (config.mainHandler as NonNullable<typeof config.mainHandler>)({
            input: parsedInput,
            ctx: config.ctx,
            client: config.client,
          }),
        config.retryOptions
      );

      if (config.transformFn !== undefined && config.transformFn !== null) {
        output = await config.transformFn(output);
      }

      output = await processOutput(output, config.outputSchemaOrFn, config.ctx, parsedInput);

      await executeLifecycleHook(config.onSuccessFn, 'onSuccess');

      if (config.onCompleteFn !== undefined && config.onCompleteFn !== null) {
        await config.onCompleteFn({
          isSuccess: true,
          isError: false,
          input: parsedInput,
          output,
          error: undefined,
        });
      }

      return { data: output as TData, error: null };
    } catch (e) {
      error = e as Error;

      if (config.onCompleteFn !== undefined && config.onCompleteFn !== null) {
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

      const finalError =
        config.catchAllFn !== undefined && config.catchAllFn !== null
          ? config.catchAllFn(error)
          : error;
      return { data: null, error: finalError as TError };
    }
  };

  return callable as CallableProcedure<TData, TError>;
}
