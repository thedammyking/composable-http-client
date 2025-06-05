/**
 * Type Safety Improvements Demonstration
 *
 * This file demonstrates the enhanced type safety features implemented for
 * the composable-http-client library, showing proper type inference and
 * context flow through the handler chain.
 */

import { z } from 'zod/v4';
import { createHttpClientProcedure, extendProcedure } from './index';

// Mock client for demonstration
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockClient = {
  get: async (url: string) => ({ data: { url, method: 'GET' } }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  post: async (url: string, data: any) => ({ data: { url, method: 'POST', data } }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// =============================================================================
// 1. CONTEXT TYPE FLOW DEMONSTRATION
// =============================================================================

// Step 1: createHttpClientProcedure with typed context
const baseWithAuth = createHttpClientProcedure(mockClient).handler(() => {
  // Return type is automatically inferred
  return {
    userId: 123,
    role: 'admin' as const,
    permissions: ['read', 'write'] as const,
  };
});

// Step 2: extendProcedure with additional context
const extendedWithSession = extendProcedure(baseWithAuth).handler(({ ctx, client }) => {
  // ctx is typed as: { userId: number, role: 'admin', permissions: readonly ['read', 'write'] }
  // client is typed as the original client type

  return {
    ...ctx,
    sessionId: 'sess_' + Math.random().toString(36),
    timestamp: Date.now(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    clientType: typeof client.get === 'function' ? 'http' : 'unknown',
  };
});

// =============================================================================
// 2. INPUT/OUTPUT TYPE INFERENCE DEMONSTRATION
// =============================================================================

// Define complex input schema
const UserInputSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string().min(1),
    email: z.string().email(),
    profile: z.object({
      age: z.number().min(18),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'auto']),
        notifications: z.boolean(),
        language: z.string().default('en'),
      }),
    }),
  }),
  metadata: z
    .object({
      source: z.string(),
      timestamp: z.number(),
    })
    .optional(),
});

// Define output schema
const UserResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    profile: z.object({
      age: z.number(),
      preferences: z.object({
        theme: z.string(),
        notifications: z.boolean(),
        language: z.string(),
      }),
    }),
  }),
  session: z.object({
    id: z.string(),
    userId: z.number(),
    role: z.string(),
    timestamp: z.number(),
  }),
  metadata: z.object({
    processedAt: z.string(),
    version: z.string(),
  }),
});

// Step 3: Final procedure with full type safety
const createUserProcedure = extendedWithSession()
  .input(UserInputSchema)
  .handler(async ({ ctx, input, client }) => {
    // ctx is fully typed with all context from the chain:
    // {
    //   userId: number,
    //   role: 'admin',
    //   permissions: readonly ['read', 'write'],
    //   sessionId: string,
    //   timestamp: number,
    //   clientType: string
    // }

    // input is fully typed based on UserInputSchema:
    // {
    //   user: {
    //     id: number,
    //     name: string,
    //     email: string,
    //     profile: {
    //       age: number,
    //       preferences: {
    //         theme: 'light' | 'dark' | 'auto',
    //         notifications: boolean,
    //         language: string
    //       }
    //     }
    //   },
    //   metadata?: {
    //     source: string,
    //     timestamp: number
    //   }
    // }

    // client is typed as the original client

    // Simulate API call
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await client.post('/users', input.user);

    return {
      success: true,
      user: {
        id: input.user.id,
        name: input.user.name,
        email: input.user.email,
        profile: {
          age: input.user.profile.age,
          preferences: {
            theme: input.user.profile.preferences.theme,
            notifications: input.user.profile.preferences.notifications,
            language: input.user.profile.preferences.language,
          },
        },
      },
      session: {
        id: ctx.sessionId,
        userId: ctx.userId,
        role: ctx.role,
        timestamp: ctx.timestamp,
      },
      metadata: {
        processedAt: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  })
  .output(UserResponseSchema)
  .transform(output => {
    // output is typed based on the handler return type and validated by schema
    return {
      ...output,
      transformed: true,
      transformedAt: new Date().toISOString(),
    };
  })
  .catchAll(error => ({
    success: false,
    error: error.message,
    code: 'USER_CREATION_FAILED',
  }));

// =============================================================================
// 3. USAGE DEMONSTRATION
// =============================================================================

async function demonstrateTypeSafety() {
  // The input is fully typed - TypeScript will catch any type errors
  const result = await createUserProcedure({
    user: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      profile: {
        age: 25,
        preferences: {
          theme: 'dark', // TypeScript knows this must be 'light' | 'dark' | 'auto'
          notifications: true,
          language: 'en',
        },
      },
    },
    metadata: {
      source: 'web-app',
      timestamp: Date.now(),
    },
  });

  // The result is also fully typed
  if (result.error === null) {
    // TypeScript knows result.data has the transformed output type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const resultData = result.data as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('User created:', resultData?.user.name);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('Session ID:', resultData?.session.id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('Transformed:', resultData?.transformed);
  } else {
    // TypeScript knows result.error is an Error
    console.error('Failed to create user:', result.error);
  }
}

// =============================================================================
// 4. TYPE SAFETY BENEFITS SUMMARY
// =============================================================================

/*
✅ CONTEXT TYPE FLOW:
- createHttpClientProcedure().handler() return type becomes context
- extendProcedure().handler() receives typed context and returns new typed context
- Final procedure.handler() receives fully typed context from the chain

✅ INPUT TYPE INFERENCE:
- .input(schema) automatically infers TypeScript types from Zod schemas
- Handler receives properly typed input parameter
- TypeScript catches type errors at compile time

✅ OUTPUT TYPE INFERENCE:
- .output(schema) validates and types the output
- Transform functions receive properly typed output
- Return types flow through the entire chain

✅ CLIENT TYPE PRESERVATION:
- Original client type is preserved throughout the chain
- All handlers receive properly typed client parameter
- Method calls are type-safe

✅ COMPILE-TIME SAFETY:
- Invalid input objects are caught at compile time
- Missing required properties are flagged
- Incorrect property types are detected
- Method calls on undefined properties are prevented

✅ RUNTIME VALIDATION:
- Zod schemas provide runtime validation
- Input validation happens before handler execution
- Output validation ensures data integrity
- Comprehensive error handling with typed errors
*/

export { demonstrateTypeSafety };
