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
        .handler(async ({ input }) => {
          return { greeting: `Hello ${input.name}, you are ${input.age} years old` };
        })
        .catchAll(err => ({ error: err.message }));

      // Valid input
      const result1 = await testProcedure({ name: 'John', age: 30 });
      expect(result1.error).toBeNull();
      expect(result1.data).toEqual({ greeting: 'Hello John, you are 30 years old' });

      // Invalid input - intentionally missing 'age' property to test validation
      const result2 = await testProcedure({ name: 'John' } as any); // missing age
      expect(result2.error).toBeDefined();
      expect(result2.data).toBeNull();
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
      expect(result.data).toEqual({ greeting: 'Hello World' });
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
      expect(result.data).toEqual({ success: true, attempts: 3 });
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
      expect(result.data).toEqual({ value: 10, doubled: 20 });
    });
  });

  describe('Enhanced Type Safety', () => {
    it('should demonstrate typed context flow through createHttpClientProcedure', async () => {
      // Step 1: createHttpClientProcedure with typed context
      const baseWithContext = createHttpClientProcedure(mockClient).handler(() => {
        return { userId: 123, role: 'admin' as const };
      });

      const testProcedure = baseWithContext()
        .input(z.object({ action: z.string() }))
        .handler(async ({ ctx, input, client }) => {
          // ctx should be typed as { userId: number, role: 'admin' }
          // input should be typed as { action: string }
          // client should be typed as the original client type
          return {
            userId: ctx.userId,
            role: ctx.role,
            action: input.action,
            hasClient: typeof client.get === 'function',
          };
        })
        .catchAll(err => ({ error: err.message }));

      const result = await testProcedure({ action: 'test' });
      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        userId: 123,
        role: 'admin',
        action: 'test',
        hasClient: true,
      });
    });

    it('should demonstrate typed context flow through extendProcedure', async () => {
      // Step 1: Create base procedure with context
      const baseWithContext = createHttpClientProcedure(mockClient)
        .handler(() => {
          return { apiKey: 'secret123', version: '1.0' };
        })
        .catch(err => {
          throw err;
        });

      // Step 2: Extend with additional context
      const extendedProcedure = extendProcedure(baseWithContext).handler(({ ctx }) => {
        // ctx should be typed as { apiKey: string, version: string }
        // client should be typed as the original client type
        return {
          ...ctx,
          sessionId: 'sess_456',
          timestamp: Date.now(),
        };
      });

      // Step 3: Final procedure using both contexts
      const testProcedure = extendedProcedure()
        .input(z.object({ userId: z.number(), action: z.string() }))
        .handler(async ({ ctx, input, client }) => {
          // ctx should be typed as { apiKey: string, version: string, sessionId: string, timestamp: number }
          // input should be typed as { userId: number, action: string }
          return {
            apiKey: ctx.apiKey,
            version: ctx.version,
            sessionId: ctx.sessionId,
            timestamp: ctx.timestamp,
            userId: input.userId,
            action: input.action,
            hasClient: typeof client.post === 'function',
          };
        })
        .catchAll(err => ({ error: err.message }));

      const result = await testProcedure({ userId: 789, action: 'create' });
      expect(result.error).toBeNull();
      const resultData = result.data as any;
      expect(resultData?.apiKey).toBe('secret123');
      expect(resultData?.version).toBe('1.0');
      expect(resultData?.sessionId).toBe('sess_456');
      expect(resultData?.userId).toBe(789);
      expect(resultData?.action).toBe('create');
      expect(resultData?.hasClient).toBe(true);
      expect(typeof resultData?.timestamp).toBe('number');
    });

    it('should handle complex input/output type inference', async () => {
      const inputSchema = z.object({
        user: z.object({
          id: z.number(),
          name: z.string(),
          email: z.string().email(),
        }),
        preferences: z.object({
          theme: z.enum(['light', 'dark']),
          notifications: z.boolean(),
        }),
      });

      const outputSchema = z.object({
        success: z.boolean(),
        user: z.object({
          id: z.number(),
          name: z.string(),
          email: z.string(),
        }),
        settings: z.object({
          theme: z.string(),
          notifications: z.boolean(),
          updatedAt: z.string(),
        }),
      });

      const testProcedure = procedure()
        .input(inputSchema)
        .handler(async ({ input }) => {
          // input should be fully typed based on the Zod schema
          return {
            success: true,
            user: {
              id: input.user.id,
              name: input.user.name,
              email: input.user.email,
            },
            settings: {
              theme: input.preferences.theme,
              notifications: input.preferences.notifications,
              updatedAt: new Date().toISOString(),
            },
          };
        })
        .output(outputSchema)
        .catchAll(err => ({ error: err.message }));

      const result = await testProcedure({
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
        },
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      });

      expect(result.error).toBeNull();
      const resultData = result.data as any;
      expect(resultData?.success).toBe(true);
      expect(resultData?.user.name).toBe('John Doe');
      expect(resultData?.settings.theme).toBe('dark');
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
      const resultData = result.data as any;
      expect(resultData?.hasClient).toBe(true);
    });
  });
});
