import type { BaseProcedure } from '../types/core';
import type {
  ExtendedProcedureBuilder,
  ExtendedProcedureBuilderWithHandler,
} from '../types/extend';
import { createProcedureBuilder as createProcedure } from './builder';
import {
  INTERNAL_GET_CTX,
  INTERNAL_GET_CLIENT,
  hasInternalAccess,
  addInternalAccess,
} from './internal-symbols';

// Extract context and client types from BaseProcedure
type ExtractCtx<T> = T extends BaseProcedure<infer TCtx, unknown> ? TCtx : unknown;
type ExtractClient<T> = T extends BaseProcedure<unknown, infer TClient> ? TClient : unknown;

export function extendProcedure<TBaseProcedure extends BaseProcedure>(
  baseProcedure: TBaseProcedure
): ExtendedProcedureBuilder<ExtractClient<TBaseProcedure>, ExtractCtx<TBaseProcedure>> {
  return {
    handler<TNewCtx>(
      ctxHandler: (args: {
        readonly ctx: ExtractCtx<TBaseProcedure>;
        readonly client: ExtractClient<TBaseProcedure>;
      }) => TNewCtx
    ): ExtendedProcedureBuilderWithHandler<ExtractClient<TBaseProcedure>, TNewCtx> {
      // Get the base procedure instance to access internal methods
      const baseProcedureInstance = baseProcedure();

      if (
        !hasInternalAccess<ExtractCtx<TBaseProcedure>, ExtractClient<TBaseProcedure>>(
          baseProcedureInstance
        )
      ) {
        throw new Error('Base procedure does not support internal access');
      }

      let ctx: TNewCtx | undefined;
      let creationError: Error | null = null;

      try {
        ctx = ctxHandler({
          ctx: baseProcedureInstance[INTERNAL_GET_CTX](),
          client: baseProcedureInstance[INTERNAL_GET_CLIENT](),
        });
      } catch (err) {
        creationError = err instanceof Error ? err : new Error(String(err));
      }

      const procedureFactory = () => {
        if (ctx === undefined) {
          throw new Error('Context was not properly initialized');
        }
        return createProcedure<TNewCtx, ExtractClient<TBaseProcedure>>(
          ctx,
          baseProcedureInstance[INTERNAL_GET_CLIENT]()
        );
      };

      const withHandlerBuilder = Object.assign(procedureFactory, {
        catch(
          creationErrorHandler: (err: Error) => void
        ): ExtendedProcedureBuilderWithHandler<ExtractClient<TBaseProcedure>, TNewCtx> {
          if (creationError !== null && creationError !== undefined) {
            try {
              creationErrorHandler(creationError);
              // Since the handler should throw, we shouldn't reach this point
              throw new Error('Error handler should have thrown an error');
            } catch (catchError) {
              throw catchError;
            }
          }

          // If no creation error, return the original context
          const newProcedureFactory = () => {
            if (ctx === undefined) {
              throw new Error('Context was not properly initialized');
            }
            return createProcedure<TNewCtx, ExtractClient<TBaseProcedure>>(
              ctx,
              baseProcedureInstance[INTERNAL_GET_CLIENT]()
            );
          };

          const resultBuilderBase = Object.assign(newProcedureFactory, {
            catch() {
              throw new Error('catch() can only be called once.');
            },
          });

          // Add symbol-based internal access using type-safe helper
          if (ctx === undefined) {
            throw new Error('Context was not properly initialized');
          }
          const resultBuilder = addInternalAccess(
            resultBuilderBase,
            ctx,
            baseProcedureInstance[INTERNAL_GET_CLIENT]()
          );

          return resultBuilder;
        },
      });

      // Add symbol-based internal access to the main builder using type-safe helper
      if (ctx === undefined) {
        throw new Error('Context was not properly initialized');
      }
      const typedBuilder = addInternalAccess(
        withHandlerBuilder,
        ctx,
        baseProcedureInstance[INTERNAL_GET_CLIENT]()
      );

      if (creationError !== null && creationError !== undefined) {
        throw creationError;
      }

      return typedBuilder;
    },
  };
}
