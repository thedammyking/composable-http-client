import type { $ZodType } from 'zod/v4/core';

import type { Result, RetryDelay, OutputSchemaOrFn } from './base';

// Utility type to extract Zod schema type
type InferZodType<T> = T extends $ZodType<infer U> ? U : never;

// Enhanced ProcedureBuilder with proper type tracking
export interface ProcedureBuilder<
  TCtx = unknown,
  TClient = unknown,
  TInput = unknown,
  TOutput = unknown,
> {
  input<TInputSchema extends $ZodType>(
    schema: TInputSchema
  ): ProcedureBuilder<TCtx, TClient, InferZodType<TInputSchema>, TOutput>;

  onStart(fn: () => void | Promise<void>): ProcedureBuilder<TCtx, TClient, TInput, TOutput>;

  onSuccess(fn: () => void | Promise<void>): ProcedureBuilder<TCtx, TClient, TInput, TOutput>;

  retry(options?: {
    readonly retries?: number;
    readonly delay?: RetryDelay;
  }): ProcedureBuilder<TCtx, TClient, TInput, TOutput>;

  handler<THandlerOutput>(
    fn: (params: {
      readonly input: TInput;
      readonly ctx: TCtx;
      readonly client: TClient;
    }) => Promise<THandlerOutput> | THandlerOutput
  ): ProcedureBuilder<TCtx, TClient, TInput, THandlerOutput>;

  output<TOutputSchema extends OutputSchemaOrFn<TCtx, TInput, unknown>>(
    schemaOrFn: TOutputSchema
  ): ProcedureBuilder<
    TCtx,
    TClient,
    TInput,
    TOutputSchema extends $ZodType<infer U>
      ? U
      : TOutputSchema extends (ctx: TCtx, input: TInput) => $ZodType<infer V>
        ? V
        : TOutput
  >;

  transform<TResponse = unknown>(
    fn: (response: TResponse) => TOutput | Promise<TOutput>
  ): ProcedureBuilder<TCtx, TClient, TInput, TOutput>;

  onComplete<TResult>(
    fn: (info: {
      readonly result: TResult | null;
      readonly error: Error | null;
      readonly duration: number;
    }) => void | Promise<void>
  ): ProcedureBuilder<TCtx, TClient, TInput, TOutput>;

  catchAll<TError>(fn: (err: Error) => TError): CallableProcedure<TOutput, TError>;

  // Make the builder callable without catchAll
  (input?: TInput): Promise<Result<TOutput, Error>>;
}

export type CallableProcedure<TData = unknown, TError = Error> = (
  input?: unknown
) => Promise<Result<TData, TError>>;

export type BaseProcedure<TCtx = unknown, TClient = unknown> = () => ProcedureBuilder<
  TCtx,
  TClient
>;
