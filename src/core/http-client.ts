import type { ClassicHttpClient } from '../types/client';
import type {
  HttpClientProcedureBuilder,
  HttpClientProcedureBuilderWithHandler,
} from '../types/http-client';
import { createProcedureBuilder as createProcedure } from './builder';

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
        });

      if (creationError !== null && creationError !== undefined) {
        throw creationError;
      }

      return withHandlerBuilder;
    },
    _getCtx: () => null,
    _getClient: () => client,
  });

  return builder;
}
