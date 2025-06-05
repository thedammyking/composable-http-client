import type { ProcedureBuilder } from './core';

export interface ExtendedProcedureBuilder<TClient = unknown> {
  handler(
    ctxHandler: (args: { ctx: unknown; client: TClient }) => unknown
  ): ExtendedProcedureBuilderWithHandler<TClient>;
}

export interface ExtendedProcedureBuilderWithHandler<TClient = unknown> {
  (): ProcedureBuilder<unknown, TClient>;
  catch(
    creationErrorHandler: (err: Error) => unknown
  ): ExtendedProcedureBuilderWithHandler<TClient>;
  _getCtx(): unknown;
  _getClient(): TClient;
}
