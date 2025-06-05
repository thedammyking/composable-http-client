import type { ZodType } from 'zod/v4';

import type { Result, RetryDelay } from './base';

export interface ProcedureBuilder<TCtx = any, TClient = any> {
  input(schema: ZodType): ProcedureBuilder<TCtx, TClient>;
  onStart(fn: () => void | Promise<void>): ProcedureBuilder<TCtx, TClient>;
  onSuccess(fn: () => void | Promise<void>): ProcedureBuilder<TCtx, TClient>;
  retry(options?: { retries?: number; delay?: RetryDelay }): ProcedureBuilder<TCtx, TClient>;
  handler(fn: (params: any) => Promise<any> | any): ProcedureBuilder<TCtx, TClient>;
  output(schemaOrFn: any): ProcedureBuilder<TCtx, TClient>;
  transform(fn: (output: any) => any | Promise<any>): ProcedureBuilder<TCtx, TClient>;
  onComplete(fn: (info: any) => void | Promise<void>): ProcedureBuilder<TCtx, TClient>;
  catchAll(fn: (err: any) => any): CallableProcedure<any>;
  _getCtx(): TCtx;
  _getClient(): TClient;
}

export interface CallableProcedure<TResult = any> {
  (input: any): Promise<Result<TResult>>;
}

export type BaseProcedure<TCtx = any, TClient = any> = {
  (): ProcedureBuilder<TCtx, TClient>;
  _getCtx(): TCtx;
  _getClient(): TClient;
};
