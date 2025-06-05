import type { ClassicHttpClient } from '../types/client';
import type {
  HttpClientProcedureBuilder,
  HttpClientProcedureBuilderWithHandler,
} from '../types/http-client';
import { createProcedureBuilder as createProcedure } from './builder';

export function createHttpClientProcedure<TClient extends ClassicHttpClient>(
  client: TClient
): HttpClientProcedureBuilder<TClient> {
  const baseProcedureFactory = () => createProcedure(null, client);

  const builder: HttpClientProcedureBuilder<TClient> = Object.assign(baseProcedureFactory, {
    handler(ctxHandler: () => any): HttpClientProcedureBuilderWithHandler<TClient> {
      let ctx: any;
      let creationError: Error | null = null;

      try {
        ctx = ctxHandler();
      } catch (err) {
        creationError = err instanceof Error ? err : new Error(String(err));
      }

      const procedureFactory = () => createProcedure(ctx, client);

      const withHandlerBuilder: HttpClientProcedureBuilderWithHandler<TClient> = Object.assign(
        procedureFactory,
        {
          catch(
            creationErrorHandler: (err: Error) => any
          ): HttpClientProcedureBuilderWithHandler<TClient> {
            if (creationError) {
              try {
                ctx = creationErrorHandler(creationError);
              } catch (catchError) {
                throw catchError;
              }
            }

            const newProcedureFactory = () => createProcedure(ctx, client);
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

      if (creationError) {
        throw creationError;
      }

      return withHandlerBuilder;
    },
    _getCtx: () => null,
    _getClient: () => client,
  });

  return builder;
}
