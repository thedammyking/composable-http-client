import { type $ZodType, safeParse } from 'zod/v4/core';
import type { OutputSchemaOrFn } from '../types/base';

export async function processInput(input: unknown, inputSchema?: $ZodType): Promise<unknown> {
  if (inputSchema === undefined || inputSchema === null) return input;

  const result = safeParse(inputSchema, input);
  if (!result.success) {
    throw new Error(`Input validation failed: ${result.error.message}`);
  }
  return result.data;
}

export async function processOutput(
  output: unknown,
  outputSchemaOrFn: OutputSchemaOrFn<unknown, unknown, unknown> | undefined,
  ctx: unknown,
  input: unknown
): Promise<unknown> {
  if (outputSchemaOrFn === undefined || outputSchemaOrFn === null) return output;
  if (typeof outputSchemaOrFn === 'function') {
    const schema = outputSchemaOrFn({ ctx, input, output });
    const result = safeParse(schema, output);
    if (!result.success) {
      throw new Error(`Output validation failed: ${result.error.message}`);
    }
    return result.data;
  } else {
    const result = safeParse(outputSchemaOrFn, output);
    if (!result.success) {
      throw new Error(`Output validation failed: ${result.error.message}`);
    }
    return result.data;
  }
}
