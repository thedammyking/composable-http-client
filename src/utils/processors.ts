import type { ZodType } from 'zod/v4';

export async function processInput(input: any, inputSchema?: ZodType): Promise<any> {
  if (!inputSchema) return input;

  try {
    return inputSchema.parse(input);
  } catch (error) {
    throw new Error(
      `Input validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function processOutput(
  output: any,
  outputSchemaOrFn: any,
  ctx: any,
  input: any
): Promise<any> {
  if (!outputSchemaOrFn) return output;

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
