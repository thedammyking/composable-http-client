import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod/v4';
import { createHttpClientProcedure, extendProcedure } from '../src/index';
import type { ClassicHttpClient } from '../src/types';

// Mock HTTP client
const mockClient = {
  request: async (config: any) => ({ data: config }),
  get: async (url: string) => Promise.resolve({ data: { url, method: 'GET' } }),
  post: async (url: string, data: any) => Promise.resolve({ data: { url, method: 'POST', data } }),
  put: async (url: string, data: any) => Promise.resolve({ data: { url, method: 'PUT', data } }),
  patch: async (url: string, data: any) =>
    Promise.resolve({ data: { url, method: 'PATCH', data } }),
  delete: async (url: string) => Promise.resolve({ data: { url, method: 'DELETE' } }),
  head: async (url: string) => Promise.resolve({ data: { url, method: 'HEAD' } }),
  options: async (url: string) => Promise.resolve({ data: { url, method: 'OPTIONS' } }),
  getUri: async (config: any) => Promise.resolve(config?.url || ''),
} as ClassicHttpClient<any>;

describe('Composable HTTP Client', () => {
  let procedure: ReturnType<typeof createHttpClientProcedure>;

  beforeEach(() => {
    procedure = createHttpClientProcedure(mockClient);
  });

  describe('Basic Procedure Builder', () => {
    it('should create a basic procedure', () => {
      const proc = procedure();
      expect(proc).toBeDefined();
      expect(typeof proc.input).toBe('function');
      expect(typeof proc.handler).toBe('function');
      expect(typeof proc.output).toBe('function');
    });

    it('should validate input with Zod schema', async () => {
      const inputSchema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const testProcedure = procedure()
        .input(inputSchema)
        .handler(async ({ name, age }: { name: string; age: number }) => {
          return { greeting: `Hello ${name}, you are ${age} years old` };
        })
        .catchAll(err => ({ error: err.message }));

      // Valid input
      const result1 = await testProcedure({ name: 'John', age: 30 });
      expect(result1.error).toBeNull();
      expect(result1.result).toEqual({ greeting: 'Hello John, you are 30 years old' });

      // Invalid input
      const result2 = await testProcedure({ name: 'John' }); // missing age
      expect(result2.error).toBeDefined();
      expect(result2.result).toBeNull();
    });

    it('should validate output with Zod schema', async () => {
      const outputSchema = z.object({
        greeting: z.string(),
      });

      const testProcedure = procedure()
        .handler(async () => {
          return { greeting: 'Hello World' };
        })
        .output(outputSchema)
        .catchAll(err => ({ error: err.message }));

      const result = await testProcedure({});
      expect(result.error).toBeNull();
      expect(result.result).toEqual({ greeting: 'Hello World' });
    });

    it('should handle lifecycle hooks', async () => {
      const hooks = {
        onStart: false,
        onSuccess: false,
        onComplete: false,
      };

      const testProcedure = procedure()
        .onStart(async () => {
          hooks.onStart = true;
        })
        .onSuccess(async () => {
          hooks.onSuccess = true;
        })
        .onComplete(async () => {
          hooks.onComplete = true;
        })
        .handler(async () => {
          return { success: true };
        })
        .catchAll(err => ({ error: err.message }));

      await testProcedure({});

      expect(hooks.onStart).toBe(true);
      expect(hooks.onSuccess).toBe(true);
      expect(hooks.onComplete).toBe(true);
    });

    it('should handle retry logic', async () => {
      let attempts = 0;

      const testProcedure = procedure()
        .retry({ retries: 3, delay: 10 })
        .handler(async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Server error');
          }
          return { success: true, attempts };
        })
        .catchAll(err => ({ error: err.message }));

      const result = await testProcedure({});
      expect(result.error).toBeNull();
      expect(result.result).toEqual({ success: true, attempts: 3 });
    });

    it('should handle transform function', async () => {
      const testProcedure = procedure()
        .handler(async () => {
          return { value: 10 };
        })
        .transform(output => {
          return { ...output, doubled: output.value * 2 };
        })
        .catchAll(err => ({ error: err.message }));

      const result = await testProcedure({});
      expect(result.error).toBeNull();
      expect(result.result).toEqual({ value: 10, doubled: 20 });
    });
  });

  describe('Extended Procedures', () => {
    it('should extend base procedures', () => {
      const extended = extendProcedure(procedure);

      expect(extended).toBeDefined();
      expect(typeof extended.handler).toBe('function');
    });

    it('should handle context in extended procedures', async () => {
      const testProcedure = extendProcedure(procedure).handler(({ ctx, client }) => {
        return {
          hasContext: ctx !== null,
          hasClient: client !== null,
          contextType: typeof ctx,
        };
      });

      const testAction = testProcedure()
        .input(z.object({ name: z.string() }))
        .handler(async ({ ctx, client, input }) => {
          return {
            hasContext: ctx !== null,
            hasClient: client !== null,
            contextType: typeof ctx,
            input,
          };
        })
        .catchAll(err => ({ error: err.message }));

      const result = await testAction({ name: 'John' });
      expect(result.error).toBeNull();
      expect(result.result?.hasClient).toBe(true);
    });
  });
});
