import type { ProcedureBuilder } from './core';

export interface HttpClientProcedureBuilder<TClient = unknown> {
  (): ProcedureBuilder<null, TClient>;
  handler<TCtx>(ctxHandler: () => TCtx): HttpClientProcedureBuilderWithHandler<TClient, TCtx>;
  _getCtx(): null;
  _getClient(): TClient;
}

export interface HttpClientProcedureBuilderWithHandler<TClient = unknown, TCtx = unknown> {
  (): ProcedureBuilder<TCtx, TClient>;
  catch(
    creationErrorHandler: (err: Error) => void
  ): HttpClientProcedureBuilderWithHandler<TClient, TCtx>;
  _getCtx(): TCtx;
  _getClient(): TClient;
}
