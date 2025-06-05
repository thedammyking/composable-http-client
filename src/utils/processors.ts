import type { ZodType } from 'zod/v4';
import type { OutputSchemaOrFn } from '../types/base';

export async function processInput(input: unknown, inputSchema?: ZodType): Promise<unknown> {
  if (inputSchema === undefined || inputSchema === null) return input;

  try {
    return inputSchema.parse(input);
  } catch (error) {
    throw new Error(
      `Input validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function processOutput(
  output: unknown,
  outputSchemaOrFn: OutputSchemaOrFn<unknown, unknown, unknown> | undefined,
  ctx: unknown,
  input: unknown
): Promise<unknown> {
  if (outputSchemaOrFn === undefined || outputSchemaOrFn === null) return output;

  try {
    if (typeof outputSchemaOrFn === 'function') {
      const schema = outputSchemaOrFn({ ctx, input, output });
      return schema.parse(output);
    } else {
      return outputSchemaOrFn.parse(output);
    }
  } catch (error) {
    throw new Error(
      `Output validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
