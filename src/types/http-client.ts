import type { ProcedureBuilder } from './core';

export type HttpClientProcedureBuilder<TClient = any> = {
  (): ProcedureBuilder<null, TClient>;
  handler(ctxHandler: () => any): HttpClientProcedureBuilderWithHandler<TClient>;
  _getCtx(): null;
  _getClient(): TClient;
};

export type HttpClientProcedureBuilderWithHandler<TClient = any> = {
  (): ProcedureBuilder<any, TClient>;
  catch(creationErrorHandler: (err: Error) => any): HttpClientProcedureBuilderWithHandler<TClient>;
  _getCtx(): any;
  _getClient(): TClient;
};
