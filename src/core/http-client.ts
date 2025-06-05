import type { ClassicHttpClient } from '../types/client';
import type {
  HttpClientProcedureBuilder,
  HttpClientProcedureBuilderWithHandler,
} from '../types/http-client';
import { createProcedureBuilder as createProcedure } from './builder';
import { addInternalAccess } from './internal-symbols';

export function createHttpClientProcedure<TClient extends ClassicHttpClient>(
  client: TClient
): HttpClientProcedureBuilder<TClient> {
  const baseProcedureFactory = () => createProcedure<null, TClient>(null, client);

  const builder: HttpClientProcedureBuilder<TClient> = Object.assign(baseProcedureFactory, {
    handler<TCtx>(ctxHandler: () => TCtx): HttpClientProcedureBuilderWithHandler<TClient, TCtx> {
      let ctx: TCtx;
      let creationError: Error | null = null;

      try {
        ctx = ctxHandler();
      } catch (err) {
        creationError = err instanceof Error ? err : new Error(String(err));
        // Initialize ctx to a placeholder value that will cause an error if used
        ctx = undefined as never;
      }

      const procedureFactory = () => createProcedure<TCtx, TClient>(ctx, client);

      const withHandlerBuilder: HttpClientProcedureBuilderWithHandler<TClient, TCtx> =
        Object.assign(procedureFactory, {
          catch(
            creationErrorHandler: (err: Error) => void
          ): HttpClientProcedureBuilderWithHandler<TClient, TCtx> {
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
            const newProcedureFactory = () => createProcedure<TCtx, TClient>(ctx, client);
            const resultBuilder = Object.assign(newProcedureFactory, {
              catch() {
                throw new Error('catch() can only be called once.');
              },
            });

            // Add symbol-based internal access using type-safe helper
            const typedResultBuilder = addInternalAccess(resultBuilder, ctx, client);

            return typedResultBuilder;
          },
        });

      // Add symbol-based internal access using type-safe helper
      const typedWithHandlerBuilder = addInternalAccess(withHandlerBuilder, ctx, client);

      if (creationError !== null && creationError !== undefined) {
        throw creationError;
      }

      return typedWithHandlerBuilder;
    },
  });

  // Add symbol-based internal access to the base builder using type-safe helper
  const typedBuilder = addInternalAccess(builder, null, client);

  return typedBuilder;
}
