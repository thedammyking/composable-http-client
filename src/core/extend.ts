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
      ctxHandler: (args: {
        ctx: unknown;
        client: ReturnType<TBaseProcedure['_getClient']>;
      }) => unknown
    ): ExtendedProcedureBuilderWithHandler<ReturnType<TBaseProcedure['_getClient']>> {
      let ctx: unknown;
      let creationError: Error | null = null;

      try {
        ctx = ctxHandler({
          ctx: baseProcedure._getCtx(),
          client: baseProcedure._getClient() as ReturnType<TBaseProcedure['_getClient']>,
        });
      } catch (err) {
        creationError = err instanceof Error ? err : new Error(String(err));
      }

      const procedureFactory = () =>
        createProcedure(
          ctx,
          baseProcedure._getClient() as ReturnType<TBaseProcedure['_getClient']>
        );

      const withHandlerBuilder = Object.assign(procedureFactory, {
        catch(creationErrorHandler: (err: Error) => unknown): ExtendedProcedureBuilderWithHandler {
          if (creationError !== null && creationError !== undefined) {
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
          }) as ExtendedProcedureBuilderWithHandler<ReturnType<TBaseProcedure['_getClient']>>;
        },
        _getCtx: () => ctx,
        _getClient: () => baseProcedure._getClient(),
      });

      if (creationError !== null && creationError !== undefined) {
        throw creationError;
      }

      return withHandlerBuilder as unknown as ExtendedProcedureBuilderWithHandler<
        ReturnType<TBaseProcedure['_getClient']>
      >;
    },
  };
}
