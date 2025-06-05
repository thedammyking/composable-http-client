import type { ProcedureBuilder } from './core';

export interface ExtendedProcedureBuilder<TClient = unknown, TBaseCtx = unknown> {
  handler<TNewCtx>(
    ctxHandler: (args: { readonly ctx: TBaseCtx; readonly client: TClient }) => TNewCtx
  ): ExtendedProcedureBuilderWithHandler<TClient, TNewCtx>;
}

export interface ExtendedProcedureBuilderWithHandler<TClient = unknown, TCtx = unknown> {
  (): ProcedureBuilder<TCtx, TClient>;
  catch(
    creationErrorHandler: (err: Error) => void
  ): ExtendedProcedureBuilderWithHandler<TClient, TCtx>;
}
