import type { Result } from '../types/base';
import type { ProcedureConfig } from '../types/config';
import type { CallableProcedure } from '../types/core';
import { retry } from '../utils/retry';
import { validateConfig, executeLifecycleHook } from '../utils/validation';
import { processInput, processOutput } from '../utils/processors';

export function createCallableProcedure(config: ProcedureConfig): CallableProcedure {
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
