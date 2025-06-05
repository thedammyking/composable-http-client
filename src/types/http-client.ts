import type { ProcedureBuilder } from './core';

export interface HttpClientProcedureBuilder<TClient = unknown> {
  (): ProcedureBuilder<null, TClient>;
  handler(ctxHandler: () => unknown): HttpClientProcedureBuilderWithHandler<TClient>;
  _getCtx(): null;
  _getClient(): TClient;
}

export interface HttpClientProcedureBuilderWithHandler<TClient = unknown> {
  (): ProcedureBuilder<unknown, TClient>;
  catch(
    creationErrorHandler: (err: Error) => unknown
  ): HttpClientProcedureBuilderWithHandler<TClient>;
  _getCtx(): unknown;
  _getClient(): TClient;
}
