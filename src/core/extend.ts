import type { BaseProcedure } from '../types/core';
import type {
  ExtendedProcedureBuilder,
  ExtendedProcedureBuilderWithHandler,
} from '../types/extend';
import { createProcedureBuilder as createProcedure } from './builder';

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
