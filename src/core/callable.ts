import type { Result } from '../types/base';
import type { ProcedureConfig } from '../types/config';
import type { CallableProcedure } from '../types/core';
import { retry } from '../utils/retry';
import { validateConfig, executeLifecycleHook } from '../utils/validation';
import { processInput, processOutput } from '../utils/processors';

export function createCallableProcedure<TResult = unknown>(
  config: ProcedureConfig
): CallableProcedure<TResult> {
  validateConfig(config);

  const callable = async (input: unknown): Promise<Result<unknown>> => {
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
      output = await processOutput(output, config.outputSchemaOrFn, config.ctx, parsedInput);

      if (config.transformFn !== undefined && config.transformFn !== null) {
        output = await config.transformFn(output);
      }

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

      return { result: output, error: null };
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
      return { result: null, error: finalError as Error | null };
    }
  };

  return callable as CallableProcedure<TResult>;
}
