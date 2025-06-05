import type { ProcedureBuilder } from './core';

export type ExtendedProcedureBuilder<TClient = any> = {
  handler(
    ctxHandler: (args: { ctx: any; client: TClient }) => any
  ): ExtendedProcedureBuilderWithHandler<TClient>;
};

export type ExtendedProcedureBuilderWithHandler<TClient = any> = {
  (): ProcedureBuilder<any, TClient>;
  catch(creationErrorHandler: (err: Error) => any): ExtendedProcedureBuilderWithHandler<TClient>;
  _getCtx(): any;
  _getClient(): TClient;
};
