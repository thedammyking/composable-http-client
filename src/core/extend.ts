import type { BaseProcedure } from '../types/core';
import type {
  ExtendedProcedureBuilder,
  ExtendedProcedureBuilderWithHandler,
} from '../types/extend';
import { createProcedureBuilder as createProcedure } from './builder';

export function extendProcedure<TBaseProcedure extends BaseProcedure>(
  baseProcedure: TBaseProcedure
): ExtendedProcedureBuilder<
  ReturnType<TBaseProcedure['_getClient']>,
  ReturnType<TBaseProcedure['_getCtx']>
> {
  return {
    handler<TNewCtx>(
      ctxHandler: (args: {
        readonly ctx: ReturnType<TBaseProcedure['_getCtx']>;
        readonly client: ReturnType<TBaseProcedure['_getClient']>;
      }) => TNewCtx
    ): ExtendedProcedureBuilderWithHandler<ReturnType<TBaseProcedure['_getClient']>, TNewCtx> {
      let ctx: TNewCtx;
      let creationError: Error | null = null;

      try {
        ctx = ctxHandler({
          ctx: baseProcedure._getCtx() as ReturnType<TBaseProcedure['_getCtx']>,
          client: baseProcedure._getClient() as ReturnType<TBaseProcedure['_getClient']>,
        });
      } catch (err) {
        creationError = err instanceof Error ? err : new Error(String(err));
      }

      const procedureFactory = () =>
        createProcedure<TNewCtx, ReturnType<TBaseProcedure['_getClient']>>(
          ctx,
          baseProcedure._getClient() as ReturnType<TBaseProcedure['_getClient']>
        );

      const withHandlerBuilder = Object.assign(procedureFactory, {
        catch<TErrorCtx>(
          creationErrorHandler: (err: Error) => TErrorCtx
        ): ExtendedProcedureBuilderWithHandler<
          ReturnType<TBaseProcedure['_getClient']>,
          TErrorCtx
        > {
          if (creationError !== null && creationError !== undefined) {
            try {
              const errorCtx = creationErrorHandler(creationError);
              const newProcedureFactory = () =>
                createProcedure<TErrorCtx, ReturnType<TBaseProcedure['_getClient']>>(
                  errorCtx,
                  baseProcedure._getClient() as ReturnType<TBaseProcedure['_getClient']>
                );
              return Object.assign(newProcedureFactory, {
                catch() {
                  throw new Error('catch() can only be called once.');
                },
                _getCtx: () => errorCtx,
                _getClient: () =>
                  baseProcedure._getClient() as ReturnType<TBaseProcedure['_getClient']>,
              });
            } catch (catchError) {
              throw catchError;
            }
          }

          // If no creation error, return the original context
          const newProcedureFactory = () =>
            createProcedure<TNewCtx, ReturnType<TBaseProcedure['_getClient']>>(
              ctx,
              baseProcedure._getClient() as ReturnType<TBaseProcedure['_getClient']>
            );
          return Object.assign(newProcedureFactory, {
            catch() {
              throw new Error('catch() can only be called once.');
            },
            _getCtx: () => ctx,
            _getClient: () =>
              baseProcedure._getClient() as ReturnType<TBaseProcedure['_getClient']>,
          }) as unknown as ExtendedProcedureBuilderWithHandler<
            ReturnType<TBaseProcedure['_getClient']>,
            TErrorCtx
          >;
        },
        _getCtx: () => ctx,
        _getClient: () => baseProcedure._getClient() as ReturnType<TBaseProcedure['_getClient']>,
      });

      if (creationError !== null && creationError !== undefined) {
        throw creationError;
      }

      return withHandlerBuilder;
    },
  };
}
