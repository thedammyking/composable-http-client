import { describe, it, expect } from 'vitest';
import { z } from 'zod/v4';
import { createHttpClientProcedure } from '../src';
import {
  ValidationError,
  RetryError,
  ConfigurationError,
  isValidationError,
  isRetryError,
  isConfigurationError,
} from '../src/errors';
import type { ClassicHttpClient } from '../src/types';

// Mock HTTP client
const mockClient = {
  request: async () => ({ data: 'success' }),
  get: async () => ({ data: 'success' }),
  post: async () => ({ data: 'success' }),
  put: async () => ({ data: 'success' }),
  patch: async () => ({ data: 'success' }),
  delete: async () => ({ data: 'success' }),
  head: async () => ({ data: 'success' }),
  options: async () => ({ data: 'success' }),
  getUri: async () => '',
} as ClassicHttpClient<any>;

describe('Error Classes Integration', () => {
  describe('ValidationError', () => {
    it('should throw ValidationError for invalid input', async () => {
      const testProcedure = createHttpClientProcedure(mockClient)()
        .input(z.object({ name: z.string() }))
        .handler(async ({ input }) => ({ greeting: `Hello ${input.name}` }))
        .catchAll(err => err);

      const result = await testProcedure({ name: 123 } as any);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(isValidationError(result.error)).toBe(true);

      if (isValidationError(result.error)) {
        expect(result.error.validationType).toBe('input');
        expect(result.error.message).toBe('Input validation failed');
      }
    });

    it('should throw ValidationError for invalid output', async () => {
      const testProcedure = createHttpClientProcedure(mockClient)()
        .handler(async () => ({ invalid: 'response' }))
        .output(z.object({ valid: z.string() }))
        .catchAll(err => err);

      const result = await testProcedure({});

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(isValidationError(result.error)).toBe(true);

      if (isValidationError(result.error)) {
        expect(result.error.validationType).toBe('output');
        expect(result.error.message).toBe('Output validation failed');
      }
    });
  });

  describe('RetryError', () => {
    it('should throw RetryError when retries are exhausted', async () => {
      let attempts = 0;

      const testProcedure = createHttpClientProcedure(mockClient)()
        .retry({ retries: 3, delay: 1 })
        .handler(async () => {
          attempts++;
          throw new Error('Network failure');
        })
        .catchAll(err => err);

      const result = await testProcedure({});

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(RetryError);
      expect(isRetryError(result.error)).toBe(true);

      if (isRetryError(result.error)) {
        expect(result.error.attempts).toBe(3);
        expect(result.error.lastError.message).toBe('Network failure');
        expect(result.error.message).toContain('All 3 retry attempts failed');
      }
      expect(attempts).toBe(3);
    });

    it('should not wrap in RetryError when no retries are configured', async () => {
      const testProcedure = createHttpClientProcedure(mockClient)()
        .handler(async () => {
          throw new Error('Single failure');
        })
        .catchAll(err => err);

      const result = await testProcedure({});

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error).not.toBeInstanceOf(RetryError);
      expect((result.error as Error).message).toBe('Single failure');
    });
  });

  describe('ConfigurationError', () => {
    it('should throw ConfigurationError when handler is missing', async () => {
      const procedure = createHttpClientProcedure(mockClient)();

      // Try to call procedure without setting a handler - this should throw directly
      try {
        await procedure({});
        expect.fail('Expected ConfigurationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigurationError);
        expect(isConfigurationError(error)).toBe(true);

        if (isConfigurationError(error)) {
          expect(error.field).toBe('mainHandler');
          expect(error.message).toContain('Main handler is required');
        }
      }
    });
  });

  describe('Error handling with catchAll', () => {
    it('should handle ValidationError in catchAll', async () => {
      const testProcedure = createHttpClientProcedure(mockClient)()
        .input(z.object({ name: z.string() }))
        .handler(async ({ input }) => ({ greeting: `Hello ${input.name}` }))
        .catchAll(error => {
          if (isValidationError(error)) {
            return { type: 'validation', message: error.message, field: error.validationType };
          }
          return { type: 'unknown', message: error.message };
        });

      const result = await testProcedure({ name: 123 } as any);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        type: 'validation',
        message: 'Input validation failed',
        field: 'input',
      });
    });
  });
});
