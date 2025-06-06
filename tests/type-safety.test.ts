import { z } from 'zod/v4';
import { describe, it, expect, beforeEach } from 'vitest';
import { createHttpClientProcedure } from '../src';
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

describe('Type Safety Improvements', () => {
  let procedure: ReturnType<typeof createHttpClientProcedure>;

  beforeEach(() => {
    procedure = createHttpClientProcedure(mockClient);
  });

  describe('Procedures without catchAll', () => {
    it('should be callable without catchAll and return Result<TData, Error>', async () => {
      const testProcedure = procedure()
        .input(z.object({ name: z.string() }))
        .handler(async ({ input }) => {
          return { greeting: `Hello ${input.name}` };
        });

      // Should be callable without catchAll
      const result = await testProcedure({ name: 'John' });

      expect(result.error).toBeNull();
      expect(result.data).toEqual({ greeting: 'Hello John' });

      // Type check: result should be Result<{ greeting: string }, Error>
      if (result.error === null) {
        // TypeScript should know result.data is { greeting: string }
        expect(result.data?.greeting).toBe('Hello John');
      } else {
        // TypeScript should know result.error is Error
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should handle errors without catchAll', async () => {
      const testProcedure = procedure()
        .input(z.object({ shouldFail: z.boolean() }))
        .handler(async ({ input }) => {
          if (input.shouldFail) {
            throw new Error('Intentional failure');
          }
          return { success: true };
        });

      const result = await testProcedure({ shouldFail: true });

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe('Intentional failure');
    });
  });

  describe('Procedures with catchAll', () => {
    it('should properly infer error type from catchAll function', async () => {
      const testProcedure = procedure()
        .input(z.object({ name: z.string() }))
        .handler(async ({ input }) => {
          if (input.name === 'fail') {
            throw new Error('Test error');
          }
          return { greeting: `Hello ${input.name}` };
        })
        .catchAll(err => ({
          error: err.message,
          code: 'CUSTOM_ERROR',
          timestamp: new Date().toISOString(),
        }));

      // Test success case
      const successResult = await testProcedure({ name: 'John' });
      expect(successResult.error).toBeNull();
      expect(successResult.data).toEqual({ greeting: 'Hello John' });

      // Test error case
      const errorResult = await testProcedure({ name: 'fail' });
      expect(errorResult.data).toBeNull();
      expect(errorResult.error).toEqual({
        error: 'Test error',
        code: 'CUSTOM_ERROR',
        timestamp: expect.any(String),
      });

      // Type check: errorResult should be Result<{ greeting: string }, { error: string, code: string, timestamp: string }>
      if (errorResult.error !== null) {
        expect(errorResult.error.code).toBe('CUSTOM_ERROR');
        expect(typeof errorResult.error.timestamp).toBe('string');
      }
    });

    it('should work with simple string error catchAll', async () => {
      const testProcedure = procedure()
        .input(z.object({ shouldFail: z.boolean() }))
        .handler(async ({ input }) => {
          if (input.shouldFail) {
            throw new Error('Original error');
          }
          return { success: true };
        })
        .catchAll(err => err.message);

      const result = await testProcedure({ shouldFail: true });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Original error');

      // Type check: result should be Result<{ success: boolean }, string>
      if (result.error !== null) {
        expect(typeof result.error).toBe('string');
      }
    });
  });

  describe('Complex procedure chains', () => {
    it('should maintain type safety through transform and catchAll', async () => {
      const testProcedure = procedure()
        .input(
          z.object({
            user: z.object({
              id: z.number(),
              name: z.string(),
            }),
          })
        )
        .handler(async ({ input }) => {
          return {
            userId: input.user.id,
            userName: input.user.name,
            processed: true,
          };
        })
        .transform<{ userId: number; userName: string; processed: boolean }>(response => ({
          ...response,
          transformedAt: new Date().toISOString(),
          version: '1.0',
        }))
        .catchAll(err => ({
          failed: true,
          reason: err.message,
          retryable: true,
        }));

      const result = await testProcedure({
        user: { id: 1, name: 'Test User' },
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        userId: 1,
        userName: 'Test User',
        processed: true,
        transformedAt: expect.any(String),
        version: '1.0',
      });

      // Type checks should work
      if (result.error === null) {
        expect(result.data?.version).toBe('1.0');
        expect(typeof result.data?.transformedAt).toBe('string');
      }
    });
  });
});
