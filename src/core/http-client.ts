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
    handler(ctxHandler: () => unknown): HttpClientProcedureBuilderWithHandler<TClient> {
      let ctx: unknown;
      let creationError: Error | null = null;

      try {
        ctx = ctxHandler();
      } catch (err) {
        creationError = err instanceof Error ? err : new Error(String(err));
      }

      const procedureFactory = () => createProcedure<unknown, TClient>(ctx, client);

      const withHandlerBuilder: HttpClientProcedureBuilderWithHandler<TClient> = Object.assign(
        procedureFactory,
        {
          catch(
            creationErrorHandler: (err: Error) => unknown
          ): HttpClientProcedureBuilderWithHandler<TClient> {
            if (creationError !== null && creationError !== undefined) {
              try {
                ctx = creationErrorHandler(creationError);
              } catch (catchError) {
                throw catchError;
              }
            }

            const newProcedureFactory = () => createProcedure<unknown, TClient>(ctx, client);
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
