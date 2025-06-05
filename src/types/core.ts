import type { ZodType } from 'zod/v4';

import type { Result, RetryDelay, OutputSchemaOrFn } from './base';

export interface ProcedureBuilder<TCtx = unknown, TClient = unknown> {
  input<TInput>(schema: ZodType<TInput>): ProcedureBuilder<TCtx, TClient>;
  onStart(fn: () => void | Promise<void>): ProcedureBuilder<TCtx, TClient>;
  onSuccess(fn: () => void | Promise<void>): ProcedureBuilder<TCtx, TClient>;
  retry(options?: {
    readonly retries?: number;
    readonly delay?: RetryDelay;
  }): ProcedureBuilder<TCtx, TClient>;
  handler<TInput, TOutput>(
    fn: (params: TInput) => Promise<TOutput> | TOutput
  ): ProcedureBuilder<TCtx, TClient>;
  output<TInput, TOutput>(
    schemaOrFn: OutputSchemaOrFn<TCtx, TInput, TOutput>
  ): ProcedureBuilder<TCtx, TClient>;
  transform<TInput, TOutput>(
    fn: (output: TInput) => TOutput | Promise<TOutput>
  ): ProcedureBuilder<TCtx, TClient>;
  onComplete<TResult>(
    fn: (info: {
      readonly result: TResult | null;
      readonly error: Error | null;
      readonly duration: number;
    }) => void | Promise<void>
  ): ProcedureBuilder<TCtx, TClient>;
  catchAll<TResult>(fn: (err: Error) => TResult): CallableProcedure<TResult>;
  _getCtx(): TCtx;
  _getClient(): TClient;
}

export type CallableProcedure<TResult = unknown> = <TInput>(
  input: TInput
) => Promise<Result<TResult>>;

export interface BaseProcedure<TCtx = unknown, TClient = unknown> {
  (): ProcedureBuilder<TCtx, TClient>;
  _getCtx(): TCtx;
  _getClient(): TClient;
}
