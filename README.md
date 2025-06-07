# Composable HTTP Client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)

A **TypeScript-first composable HTTP client library** that revolutionizes API interactions through procedure builders, schema validation, and intelligent retry logic. Works seamlessly across **Node.js**, **browsers**, and all modern JavaScript environments.

## 💡 Why This Library?

The modern web development landscape offers many excellent tools, but often forces you to make difficult trade-offs. This library was created to solve a fundamental problem: how do you get the benefits of **composable, type-safe API interactions** without being locked into specific frameworks or requiring particular backend setups?

**The Problem:**

- **Framework Lock-in**: Many solutions tie you to specific frameworks (React-only, server-only, etc.)
- **Backend Requirements**: Some tools require you to control the backend or use specific server implementations
- **Type Safety Gaps**: Manual typing between frontend and API calls leads to runtime errors
- **Validation Scattered**: Input/output validation often duplicated across frontend and backend
- **Boilerplate Everywhere**: Repetitive error handling, retry logic, and transformation code

**The Solution:**
A **framework-agnostic, composable HTTP client** that brings the power of procedure builders and schema validation to **any** HTTP API, **any** JavaScript environment, and **any** framework - without requiring changes to your backend.

Whether you're building with React, Vue, Svelte, or vanilla JavaScript, working with REST APIs, JSON-RPC over HTTP, or custom HTTP-based backends, this library adapts to your stack instead of forcing your stack to adapt to it.

## Features

- 🎯 **Composable**: Build complex HTTP procedures using a fluent API
- 🔒 **Type-safe**: Full TypeScript support with Zod schema validation
- 🔄 **Retry Logic**: Built-in retry mechanisms with customizable delays
- 🧪 **Dual HTTP Support**: Works with both Axios and native Fetch
- 🎣 **Lifecycle Hooks**: onStart, onSuccess, onComplete hooks
- 🔧 **Transform & Hooks**: Transform responses and handle errors with lifecycle hooks
- ⚡ **Rich Error Handling**: Specialized error classes with type guards for precise error handling
- 🌐 **Framework Agnostic**: Works in Node.js (20+) and all modern browsers
- 🪶 **Tiny Bundle**: Only ~3.2KB gzipped - perfect for performance-conscious applications
- 📦 **Multiple Formats**: Supports both CJS and ESM for maximum compatibility

## Installation

```bash
# npm
npm install composable-http-client zod

# pnpm (recommended)
pnpm add composable-http-client zod

# yarn
yarn add composable-http-client zod
```

> **Note**: Zod is a dependency required for schema validation. While you can skip using `.input()` and `.output()` methods, Zod will still be included in your bundle.

### 📦 **Modular Entry Points**

The library provides four tree-shakable entry points:

- `composable-http-client` - Core functionality (procedures, builders)
- `composable-http-client/axios` - Axios HTTP client adapter
- `composable-http-client/fetch` - Fetch HTTP client adapter
- `composable-http-client/errors` - Error classes and type guards (optional)

## Quick Start

### Basic Usage with Axios

```typescript
import { createHttpClientProcedure } from 'composable-http-client';
import { createHttpClient } from 'composable-http-client/axios';
import { isHttpError } from 'composable-http-client/errors';
import { z } from 'zod';

// 1. Create HTTP client
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  headers: { Authorization: 'Bearer your-token' },
});

// 2. Create procedure builder
const procedure = createHttpClientProcedure(client);

// Define schemas
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

// 3. Build a type-safe procedure
const getUser = procedure()
  .input(z.object({ userId: z.number() }))
  .onStart(() => console.log('Fetching user...'))
  .retry({ retries: 3, delay: 1000 })
  .handler(async ({ input, client }) => {
    return client.get(`/users/${input.userId}`);
  })
  .output(userSchema)
  .onSuccess(() => console.log('User fetched successfully'))
  .catchAll(error => {
    if (isHttpError(error) && error.hasStatus(404)) {
      return { error: 'User not found' };
    }
    return { error: error.message };
  });

// 4. Use the procedure
const result = await getUser({ userId: 123 });
if (result.error) {
  console.error('Error:', result.error);
} else {
  console.log('User:', result.data); // Fully typed!
}
```

### Basic Usage with Fetch (Node.js 20+ & Browsers)

```typescript
import { createHttpClientProcedure } from 'composable-http-client';
import { createHttpClient } from 'composable-http-client/fetch';

// Create HTTP client using native fetch (available in Node.js 20+ and all modern browsers)
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  headers: { Authorization: 'Bearer your-token' },
});

const procedure = createHttpClientProcedure(client);
// ... rest is the same
```

## Environment Compatibility

This library is **framework agnostic** and works seamlessly across different JavaScript environments:

### 🟢 **Node.js Support**

- **Minimum version**: Node.js 20.0.0+
- **Axios adapter**: Full support with interceptors
- **Fetch adapter**: Uses built-in `fetch` API (Node.js 20+)
- **CommonJS & ESM**: Both module systems supported

### 🌐 **Browser Support**

- **Modern browsers**: Chrome, Firefox, Safari, Edge (ES2020+ compatible)
- **Axios adapter**: Full support in all browsers
- **Fetch adapter**: Uses native `fetch` API
- **Bundlers**: Webpack, Vite, Rollup, Parcel compatible

### 📱 **React Native**

- **Axios adapter**: Full support
- **Fetch adapter**: Uses React Native's built-in fetch

### ⚙️ **Other Environments**

- **Deno**: Compatible with both adapters
- **Bun**: Full compatibility
- **Web Workers**: Both adapters work
- **Service Workers**: Fetch adapter recommended

### 🎯 **Choosing the Right Adapter**

```typescript
// For maximum compatibility across all environments
import { createHttpClient } from 'composable-http-client/axios';

// For modern environments with native fetch (Node.js 20+, browsers)
import { createHttpClient } from 'composable-http-client/fetch';

// The core procedure builder works with any HTTP client
import { createHttpClientProcedure } from 'composable-http-client';

// Import error classes for type-safe error handling (tree-shakable)
import { HttpError, isHttpError } from 'composable-http-client/errors';
```

## 🌐 Supported Backend Types

This library is specifically designed for **HTTP-based APIs** and excels with:

### ✅ **Fully Supported**

- **REST APIs** - Perfect fit with full HTTP verb support (GET, POST, PUT, DELETE, PATCH)
- **JSON-RPC over HTTP** - Excellent for procedure-based APIs
- **Custom HTTP APIs** - Any API that communicates over HTTP/HTTPS
- **Microservices** - Great for composing calls across multiple HTTP services
- **Third-party APIs** - Works with any external HTTP API (Stripe, GitHub, etc.)

### 🟡 **Limited Support**

- **GraphQL over HTTP** - Technically possible but not recommended
  - Use dedicated GraphQL clients (Apollo, Relay) for better DX
  - GraphQL already provides its own type system and validation

### ❌ **Not Supported**

- **WebSockets** - Real-time communication (use Socket.io, native WebSockets)
- **gRPC** - Protocol buffer-based communication
- **Database drivers** - Direct database connections (use ORMs, query builders)
- **File system operations** - Local file access
- **Message queues** - Pub/sub systems (Redis, RabbitMQ, etc.)

**Why HTTP-only?** This library focuses on HTTP to provide the best possible developer experience for the most common API communication pattern, rather than trying to be a universal communication layer.

## API Reference

### createHttpClientProcedure(client)

Creates a procedure builder that can be used to compose HTTP operations.

### Procedure Methods

#### `.input(schema)`

Validates input parameters using a Zod schema.

#### `.handler(fn)`

Defines the main logic for the procedure.

#### `.output(schemaOrFn)`

Validates output using a Zod schema or dynamic schema function.

#### `.retry(options)`

Configures retry behavior:

```typescript
.retry({
  retries: 3,
  delay: 1000 // or (currentAttempt, error) => currentAttempt * 1000
})
```

#### `.transform(fn)`

Transforms the output before validation:

```typescript
.transform((output) => ({
  ...output,
  timestamp: new Date().toISOString()
}))
```

#### Lifecycle Hooks

- `.onStart(fn)` - Called before execution
- `.onSuccess(fn)` - Called on successful completion
- `.onComplete(fn)` - Called after execution (success or failure)

#### `.catchAll(fn)`

Handles errors and makes the procedure callable:

```typescript
.catchAll((error) => ({
  error: error.message,
  code: error.code
}))
```

### HTTP Client Configuration

Both Axios and Fetch clients support comprehensive configuration:

```typescript
interface ClientConfig<Tokens = Record<string, string>> {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string> | ((tokens: Tokens) => Record<string, string>);
  getTokens?: () => Tokens;
  refreshToken?: () => Promise<void>;
  logError?: (error: unknown) => Promise<void>;
  addTracing?: (context: TracingContext) => Promise<void>;
}
```

### Advanced Features

#### Automatic Token Refresh

Automatically refresh tokens on 401 responses:

```typescript
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  getTokens: () => ({
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
  }),
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
  },
  headers: tokens => ({
    Authorization: `Bearer ${tokens.accessToken}`,
  }),
});
```

#### Complex Error Handling

Handle different error types with structured responses:

```typescript
const robustProcedure = procedure()
  .input(userInputSchema)
  .retry({
    retries: 3,
    delay: (currentAttempt, error) => {
      // Exponential backoff for server errors
      if (error.response?.status >= 500) {
        return Math.pow(2, currentAttempt) * 1000;
      }
      // Fixed delay for rate limiting
      if (error.response?.status === 429) {
        return 5000;
      }
      // No retry for client errors
      return 0;
    },
  })
  .handler(async ({ input, client }) => {
    return client.post('/users', input);
  })
  .catchAll(error => {
    if (error.response?.status === 400) {
      return {
        type: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.response.data.errors,
        retryable: false,
      };
    }

    if (error.response?.status >= 500) {
      return {
        type: 'SERVER_ERROR',
        message: 'Server temporarily unavailable',
        retryable: true,
        retryAfter: 30000,
      };
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: error.message,
      retryable: false,
    };
  });
```

#### Dynamic Output Schemas

Use dynamic schemas based on context:

```typescript
.output(({ ctx, input, output }) => {
  if (input.includeMetadata) {
    return userWithMetadataSchema;
  }
  return userSchema;
})
```

#### Extended Procedures

Extend existing procedures with additional context:

```typescript
import { extendProcedure } from 'composable-http-client';

const baseProcedure = createHttpClientProcedure(client);

const withAuth = extendProcedure(baseProcedure).handler(({ ctx }) => {
  const user = getCurrentUser();
  if (user.role !== 'admin') {
    throw new Error('Insufficient permissions');
  }
  return { ...ctx, user };
});

const authenticatedProcedure = withAuth()
  .input(z.object({ userId: z.string() }))
  .handler(async ({ input, ctx, client }) => {
    return client.get(`/admin/users/${input.userId}`);
  })
  .catchAll(error => ({ error: error.message }));
```

#### File Upload & Form Data

Handle file uploads with proper form data:

```typescript
const uploadFile = procedure()
  .input(
    z.object({
      file: z.instanceof(File),
      metadata: z.object({
        title: z.string(),
        description: z.string().optional(),
      }),
    })
  )
  .handler(async ({ input, client }) => {
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('metadata', JSON.stringify(input.metadata));

    return client.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  })
  .output(
    z.object({
      fileId: z.string(),
      url: z.string().url(),
      size: z.number(),
    })
  )
  .catchAll(error => ({ error: error.message }));
```

## Error Handling

### Import Error Classes

```typescript
import {
  HttpError,
  TimeoutError,
  ValidationError,
  RetryError,
  TokenRefreshError,
  NetworkError,
  ConfigurationError,
  isHttpError,
  isTimeoutError,
  isValidationError,
  isRetryError,
  isTokenRefreshError,
  isNetworkError,
  isConfigurationError,
  type ComposableHttpErrorType,
} from 'composable-http-client/errors';
```

### Error Types

This library provides specialized error classes for different failure scenarios:

#### **HttpError**

Thrown when HTTP requests fail with specific status codes.

```typescript
const getUserProcedure = procedure()
  .input(z.object({ userId: z.number() }))
  .handler(async ({ input, client }) => {
    return client.get(`/users/${input.userId}`);
  })
  .catchAll(error => {
    if (isHttpError(error)) {
      console.log(`HTTP ${error.response.status}: ${error.message}`);

      // Check error categories
      if (error.isClientError) {
        console.log('Client error (4xx)');
      }
      if (error.isServerError) {
        console.log('Server error (5xx)');
      }

      // Check specific status codes
      if (error.hasStatus(404)) {
        return { type: 'NOT_FOUND', message: 'User not found' };
      }
      if (error.hasStatus(401)) {
        return { type: 'UNAUTHORIZED', message: 'Authentication required' };
      }

      // Access response data
      console.log('Response data:', error.response.data);
      console.log('Response headers:', error.response.headers);
    }

    return { error: error.message };
  });
```

#### **TimeoutError**

Thrown when requests exceed the configured timeout.

```typescript
.catchAll((error) => {
  if (isTimeoutError(error)) {
    console.log(`Request timed out after ${error.timeout}ms`);
    return { type: 'TIMEOUT', message: 'Request took too long' };
  }

  return { error: error.message };
});
```

#### **ValidationError**

Thrown when input or output schema validation fails.

```typescript
.catchAll((error) => {
  if (isValidationError(error)) {
    console.log(`${error.validationType} validation failed:`, error.zodError);
    return {
      type: 'VALIDATION_ERROR',
      message: `Invalid ${error.validationType}`,
      details: error.zodError
    };
  }

  return { error: error.message };
});
```

#### **RetryError**

Thrown when all retry attempts are exhausted.

```typescript
.catchAll((error) => {
  if (isRetryError(error)) {
    console.log(`All ${error.attempts} retry attempts failed`);
    console.log('Last error:', error.lastError.message);
    return { type: 'RETRY_EXHAUSTED', message: 'Service temporarily unavailable' };
  }

  return { error: error.message };
});
```

#### **TokenRefreshError**

Thrown when automatic token refresh fails.

```typescript
.catchAll((error) => {
  if (isTokenRefreshError(error)) {
    console.log('Token refresh failed:', error.originalError?.message);
    return { type: 'AUTH_ERROR', message: 'Please log in again' };
  }

  return { error: error.message };
});
```

#### **NetworkError**

Thrown for network-related failures (connection refused, DNS issues, etc.).

```typescript
.catchAll((error) => {
  if (isNetworkError(error)) {
    console.log('Network error:', error.originalError?.message);
    return { type: 'NETWORK_ERROR', message: 'Check your internet connection' };
  }

  return { error: error.message };
});
```

#### **ConfigurationError**

Thrown for configuration or setup issues.

```typescript
.catchAll((error) => {
  if (isConfigurationError(error)) {
    console.log(`Configuration error in field: ${error.field}`);
    return { type: 'CONFIG_ERROR', message: 'Invalid configuration' };
  }

  return { error: error.message };
});
```

### Comprehensive Error Handling

Use type guards to handle different error types in a single `.catchAll()`:

```typescript
const robustProcedure = procedure()
  .input(userInputSchema)
  .retry({ retries: 3, delay: 1000 })
  .handler(async ({ input, client }) => {
    return client.get(`/users/${input.userId}`);
  })
  .catchAll((error: Error) => {
    // HTTP errors
    if (isHttpError(error)) {
      if (error.hasStatus(404)) {
        return { type: 'user_not_found', message: 'User not found' };
      }
      if (error.hasStatus(401)) {
        return { type: 'unauthorized', message: 'Authentication required' };
      }
      if (error.isServerError) {
        return { type: 'server_error', message: 'Server is unavailable' };
      }
    }

    // Timeout errors
    if (isTimeoutError(error)) {
      return { type: 'timeout', message: 'Request took too long' };
    }

    // Validation errors
    if (isValidationError(error)) {
      return {
        type: 'validation_error',
        message: 'Invalid data',
        validationType: error.validationType,
      };
    }

    // Retry errors
    if (isRetryError(error)) {
      return { type: 'retry_exhausted', message: 'Service temporarily unavailable' };
    }

    // Token refresh errors
    if (isTokenRefreshError(error)) {
      return { type: 'auth_error', message: 'Please log in again' };
    }

    // Network errors
    if (isNetworkError(error)) {
      return { type: 'network_error', message: 'Check your internet connection' };
    }

    // Configuration errors
    if (isConfigurationError(error)) {
      return { type: 'config_error', message: 'Invalid configuration' };
    }

    // Generic error fallback
    return { type: 'unknown_error', message: 'Something went wrong' };
  });
```

### Creating Custom Error Handlers

Create reusable error handlers for consistent error management:

```typescript
// Reusable error handler
function createErrorHandler<T>(defaultResponse: T) {
  return (error: Error): T => {
    if (isHttpError(error)) {
      // Log HTTP errors for monitoring
      console.error('HTTP Error:', {
        status: error.response.status,
        url: error.response.url,
        data: error.response.data,
      });

      return defaultResponse;
    }

    if (isTimeoutError(error)) {
      // Log timeout errors
      console.warn(`Request timeout: ${error.timeout}ms`);
      return defaultResponse;
    }

    // Log unexpected errors
    console.error('Unexpected error:', error.message);
    return defaultResponse;
  };
}

// Use the reusable handler
const getUser = procedure()
  .input(z.object({ userId: z.number() }))
  .handler(async ({ input, client }) => {
    return client.get(`/users/${input.userId}`);
  })
  .catchAll(createErrorHandler({ error: 'Failed to fetch user' }));
```

## Testing Your Procedures

### Unit Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createHttpClientProcedure } from 'composable-http-client';

describe('User Procedures', () => {
  // Mock HTTP client
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  const procedure = createHttpClientProcedure(mockClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user successfully', async () => {
    // Arrange
    mockClient.get.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });

    const getUser = procedure()
      .input(z.object({ userId: z.number() }))
      .handler(async ({ input, client }) => {
        return client.get(`/users/${input.userId}`);
      })
      .output(userSchema)
      .catchAll(error => ({ error: error.message }));

    // Act
    const result = await getUser({ userId: 1 });

    // Assert
    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(mockClient.get).toHaveBeenCalledWith('/users/1');
  });
});
```

### Integration Testing with MSW

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('https://api.example.com/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: Number(id),
      name: `User ${id}`,
      email: `user${id}@example.com`,
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Troubleshooting

### Common Issues

#### Type Inference Problems

```typescript
// ❌ Type inference lost without input schema
const procedure = createHttpClientProcedure(client).handler(({ input }) => {
  // input type is 'unknown' because no .input() was called
  return client.get('/users');
});

// ✅ Proper type inference with input schema
const userInputSchema = z.object({ userId: z.string() });

const procedure = createHttpClientProcedure(client)
  .input(userInputSchema) // This enables type inference
  .handler(({ input }) => {
    // input is now properly typed as { userId: string }
    return client.get(`/users/${input.userId}`);
  });
```

#### Schema Validation Failures

```typescript
// ✅ Detailed error handling
.catchAll(error => {
  if (error instanceof z.ZodError) {
    return {
      error: 'Validation failed',
      details: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    };
  }

  return { error: error.message };
});
```

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  logError: async error => {
    console.error('HTTP Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
  },
  addTracing: async ({ method, url, config }) => {
    console.log(`🔍 ${method.toUpperCase()} ${url}`, {
      headers: config.headers,
      data: config.data,
    });
  },
});
```

## Real-World Examples

### E-commerce API Integration

```typescript
// Product catalog with pagination
const getProducts = procedure()
  .input(
    z.object({
      category: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().max(100).default(20),
      sortBy: z.enum(['price', 'name', 'rating']).default('name'),
    })
  )
  .handler(async ({ input, client }) => {
    const params = new URLSearchParams();
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value));
    });

    return client.get(`/products?${params}`);
  })
  .output(
    z.object({
      products: z.array(productSchema),
      total: z.number(),
      hasMore: z.boolean(),
    })
  )
  .retry({ retries: 2, delay: 1000 })
  .catchAll(error => ({ error: error.message }));

// Order creation with inventory validation
const createOrder = procedure()
  .input(
    z.object({
      items: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number().positive(),
        })
      ),
      shippingAddress: addressSchema,
      paymentMethod: z.string(),
    })
  )
  .onStart(() => analytics.track('order_creation_started'))
  .handler(async ({ input, client }) => {
    // Validate inventory first
    const inventoryCheck = await client.post('/inventory/check', {
      items: input.items,
    });

    if (!inventoryCheck.available) {
      throw new Error('Some items are out of stock');
    }

    return client.post('/orders', input);
  })
  .output(orderSchema)
  .onSuccess(() => {
    analytics.track('order_created');
  })
  .catchAll(error => ({
    error: error.message,
    code: error.code,
    recoverable: error.response?.status !== 400,
  }));
```

## Framework Integration

### React & Next.js

```typescript
// hooks/useApiProcedure.ts
import { useCallback, useMemo } from 'react';
import { createHttpClient } from 'composable-http-client/fetch';
import { createHttpClientProcedure } from 'composable-http-client';

export const useApiProcedure = () => {
  const client = useMemo(() =>
    createHttpClient({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      headers: (tokens) => ({
        'Content-Type': 'application/json',
        ...(tokens.accessToken && { Authorization: `Bearer ${tokens.accessToken}` })
      }),
      getTokens: () => ({
        accessToken: localStorage.getItem('token') || ''
      })
    }), []
  );

  return useCallback(() => createHttpClientProcedure(client), [client]);
};

// components/UserProfile.tsx
import { useState, useEffect } from 'react';
import { useApiProcedure } from '../hooks/useApiProcedure';
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const procedure = useApiProcedure();

  useEffect(() => {
    const getUser = procedure()
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, client }) => {
        return client.get(`/users/${input.id}`);
      })
      .output(userSchema)
      .onStart(() => setLoading(true))
      .onSuccess(() => setLoading(false))
      .catchAll(error => ({ error: error.message }));

    getUser({ id: userId }).then(result => {
      if (result.error) {
        setError(result.error);
      } else {
        setUser(result.data);
      }
      setLoading(false);
    });
  }, [userId, procedure]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>Welcome, {user?.name}!</div>;
}
```

### Vue 3 & Nuxt

```typescript
// composables/useApi.ts
import { createHttpClient } from 'composable-http-client/axios';
import { createHttpClientProcedure } from 'composable-http-client';

export const useApi = () => {
  const config = useRuntimeConfig();

  const client = createHttpClient({
    baseURL: config.public.apiBase,
    headers: (tokens) => ({
      'Content-Type': 'application/json',
      ...(tokens.token && { Authorization: `Bearer ${tokens.token}` })
    }),
    getTokens: () => {
      const token = useCookie('auth-token');
      return { token: token.value || '' };
    }
  });

  return createHttpClientProcedure(client);
};

// pages/users/[id].vue
<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>{{ data?.name }}</div>
  </div>
</template>

<script setup>
const route = useRoute();
const api = useApi();

const getUser = api()
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, client }) => {
    return client.get(`/users/${input.id}`);
  })
  .output(userSchema)
  .catchAll(error => ({ error: error.message }));

const { data, pending, error } = await useAsyncData('user', () =>
  getUser({ id: route.params.id as string })
);
</script>
```

### Svelte & SvelteKit

```typescript
// lib/api.ts
import { createHttpClient } from 'composable-http-client/fetch';
import { createHttpClientProcedure } from 'composable-http-client';
import { browser } from '$app/environment';
import { page } from '$app/stores';

const client = createHttpClient({
  baseURL: browser ? '/api' : 'http://localhost:5173/api',
  headers: tokens => ({
    'Content-Type': 'application/json',
    ...(tokens.sessionId && { 'X-Session-ID': tokens.sessionId }),
  }),
  getTokens: () => ({
    sessionId: browser ? document.cookie.split('sessionId=')[1]?.split(';')[0] : '',
  }),
});

export const api = createHttpClientProcedure(client);

// routes/users/[id]/+page.ts
import { api } from '$lib/api';
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export async function load({ params }) {
  const getUser = api()
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, client }) => {
      return client.get(`/users/${input.id}`);
    })
    .output(userSchema)
    .catchAll(error => ({ error: error.message }));

  const result = await getUser({ id: params.id });

  if (result.error) {
    throw error(500, result.error);
  }

  return {
    user: result.data,
  };
}
```

## Detailed API Reference

### Core Types

```typescript
// Result type for all procedures
type Result<TData, TError> = {
  data: TData | null;
  error: TError | null;
};

// Procedure configuration interface
interface ProcedureConfig {
  readonly inputSchema?: ZodType;
  readonly outputSchemaOrFn?: OutputSchemaOrFn;
  readonly mainHandler?: HandlerFunction;
  readonly transformFn?: TransformFunction;
  readonly retryOptions: RetryOptions;
  readonly onStartFn?: () => void | Promise<void>;
  readonly onSuccessFn?: () => void | Promise<void>;
  readonly onCompleteFn?: (info: {
    readonly isSuccess: boolean;
    readonly isError: boolean;
    readonly input: unknown;
    readonly output: unknown;
    readonly error: Error | undefined;
  }) => void | Promise<void>;
  readonly catchAllFn?: CatchAllFn;
  readonly ctx: unknown;
  readonly client: unknown;
}

// Retry configuration
interface RetryOptions {
  retries: number;
  delay: number | RetryDelay;
}

type RetryDelay = (currentAttempt: number, error: Error) => number;

type CompleteFn = (info: {
  readonly isSuccess: boolean;
  readonly isError: boolean;
  readonly input: unknown;
  readonly output: unknown;
  readonly error: Error | undefined;
}) => void | Promise<void>;
```

### Procedure Builder Methods

#### `.input<TInputSchema>(schema: TInputSchema)`

**Purpose**: Validates and types input parameters using Zod schema.

**Parameters**:

- `schema: ZodType` - Zod schema for input validation

**Returns**: Procedure builder with typed input

**Example**:

```typescript
.input(z.object({
  userId: z.string().uuid(),
  includeProfile: z.boolean().optional().default(false),
  fields: z.array(z.string()).optional()
}))
```

**Error Handling**: Throws validation error if input doesn't match schema.

#### `.handler<TOutput>(fn: HandlerFunction)`

**Purpose**: Defines the main procedure logic.

**Parameters**:

- `fn: HandlerFunction` - Function that executes the HTTP request

**Function Signature**:

```typescript
type HandlerFunction = (params: {
  readonly input: TInput;
  readonly ctx: TContext;
  readonly client: TClient;
}) => Promise<TOutput> | TOutput;
```

**Returns**: Procedure builder with output type

**Example**:

```typescript
.handler(async ({ input, ctx, client }) => {
  // input is fully typed based on .input() schema
  // ctx contains context from extended procedures
  // client is the HTTP client instance

  const response = await client.get(`/users/${input.userId}`, {
    params: {
      include_profile: input.includeProfile,
      fields: input.fields?.join(',')
    }
  });

  return response;
})
```

#### `.output<TOutputSchema>(schemaOrFn: TOutputSchema)`

**Purpose**: Validates output using static or dynamic schema.

**Parameters**:

- `schemaOrFn: ZodType | OutputSchemaFunction` - Schema or function returning schema

**Static Schema Example**:

```typescript
.output(z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  profile: z.object({
    avatar: z.string().url(),
    bio: z.string()
  }).optional()
}))
```

**Dynamic Schema Example**:

```typescript
.output(({ input, ctx, output }) => {
  if (input.includeProfile) {
    return userWithProfileSchema;
  }
  return basicUserSchema;
})
```

#### `.retry(options: RetryOptions)`

**Purpose**: Configures retry behavior for failed requests.

**Options**:

```typescript
interface RetryOptions {
  retries: number; // Number of retry attempts (default: 1)
  delay: number | RetryDelay; // Delay between retries
}

type RetryDelay = (currentAttempt: number, error: Error) => number;
```

**Examples**:

```typescript
// Fixed delay
.retry({ retries: 3, delay: 1000 })

// Exponential backoff
.retry({
  retries: 5,
  delay: (currentAttempt, error) => Math.pow(2, currentAttempt) * 1000
})

// Conditional retry based on error
.retry({
  retries: 3,
  delay: (currentAttempt, error) => {
    if (error.response?.status === 429) return 5000; // Rate limit
    if (error.response?.status >= 500) return currentAttempt * 2000; // Server error
    return 0; // Don't retry client errors
  }
})
```

#### `.transform<TTransformed>(fn: TransformFunction)`

**Purpose**: Transforms output before validation.

**Function Signature**:

```typescript
type TransformFunction<TOutput, TTransformed> = (
  output: TOutput
) => TTransformed | Promise<TTransformed>;
```

**Examples**:

```typescript
// Add metadata
.transform((output) => ({
  ...output,
  fetchedAt: new Date().toISOString(),
  version: '1.0'
}))

// Transform data structure
.transform((output) => ({
  ...output,
  displayName: output.name?.split(' ')[0] || 'Unknown'
}))

// Async transformation
.transform(async (output) => {
  const enriched = await enrichUserData(output);
  return enriched;
})
```

### Lifecycle Hooks

#### `.onStart(fn: () => void | Promise<void>)`

Called before procedure execution.

```typescript
.onStart(async () => {
  console.log('Starting user fetch...');
  analytics.track('user_fetch_started');
  showLoadingSpinner();
})
```

#### `.onSuccess(fn: () => void | Promise<void>)`

Called on successful completion.

```typescript
.onSuccess(async () => {
  console.log('User fetched successfully');
  analytics.track('user_fetch_success');
})
```

#### `.onComplete(fn: CompleteFn)`

Called after execution (success or failure).

```typescript
.onComplete(async ({ isSuccess, isError, input, output, error }) => {
  console.log(`Request completed`);
  hideLoadingSpinner();

  if (isError && error) {
    analytics.track('user_fetch_error', { error: error.message });
  } else if (isSuccess && output) {
    analytics.track('user_fetch_complete', { userId: output.id });
  }
})
```

## Production Deployment Guide

### Environment Configuration

```typescript
// config/http-client.ts
import { createHttpClient } from 'composable-http-client/fetch';

const createProductionClient = () => {
  return createHttpClient({
    baseURL: process.env.API_BASE_URL,
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    headers: tokens => ({
      'Content-Type': 'application/json',
      'User-Agent': `${process.env.APP_NAME}/${process.env.APP_VERSION}`,
      ...(tokens.accessToken && {
        Authorization: `Bearer ${tokens.accessToken}`,
      }),
    }),
    getTokens: () => ({
      accessToken: getSecureToken(),
      refreshToken: getRefreshToken(),
    }),
    refreshToken: async () => {
      await refreshAuthTokens();
    },
    logError: async error => {
      // Send to monitoring service
      await logger.error('HTTP Client Error', {
        message: error.message,
        stack: error.stack,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    },
    addTracing: async ({ method, url, config }) => {
      // Add distributed tracing
      const span = tracer.startSpan(`http_${method.toLowerCase()}`);
      span.setAttributes({
        'http.method': method,
        'http.url': url,
        'http.user_agent': config.headers?.['User-Agent'],
      });
    },
  });
};
```

### Error Monitoring

```typescript
// utils/error-monitoring.ts
import { captureException, addBreadcrumb } from '@sentry/node';

export const createMonitoredProcedure = (client: HttpClient) => {
  return createHttpClientProcedure(client)
    .onStart(() => {
      addBreadcrumb({
        message: 'HTTP request started',
        category: 'http',
        level: 'info',
      });
    })
    .onComplete(({ isSuccess, isError, input, output, error }) => {
      if (isError && error) {
        captureException(error, {
          tags: {
            component: 'http-client',
          },
        });
      }
    });
};
```

### Caching Strategies

```typescript
// utils/cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export const createCachedProcedure = (client: HttpClient) => {
  return createHttpClientProcedure(client).handler(async ({ input, client }) => {
    const cacheKey = JSON.stringify(input);

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Make request
    const result = await client.get('/data', { params: input });

    // Cache result
    cache.set(cacheKey, result);

    return result;
  });
};
```

## Supercharge with Data Fetching Libraries

This library is designed to work seamlessly with data fetching and caching libraries, giving your HTTP procedures superpowers:

### With React Query / TanStack Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { createHttpClient } from 'composable-http-client/fetch';
import { createHttpClientProcedure } from 'composable-http-client';

const client = createHttpClient({ baseURL: '/api' });
const procedure = createHttpClientProcedure(client);

// Create type-safe procedures
const getUser = procedure()
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, client }) => client.get(`/users/${input.id}`))
  .output(userSchema)
  .catchAll(error => ({ error: error.message }));

const updateUser = procedure()
  .input(z.object({ id: z.string(), data: updateUserSchema }))
  .handler(async ({ input, client }) =>
    client.put(`/users/${input.id}`, input.data)
  )
  .output(userSchema)
  .catchAll(error => ({ error: error.message }));

// Use with React Query for caching, background updates, etc.
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser({ id: userId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  // React Query handles caching, loading states, error states
  // Composable HTTP Client handles validation, retry logic, type safety
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <UserForm user={user} onSave={mutation.mutate} />;
}
```

### Why This Approach Works

- **🎯 Focused Responsibilities**: Data fetching libraries handle caching, background updates, and state management
- **🔒 Type Safety**: Composable HTTP Client ensures end-to-end type safety and validation
- **🔄 Retry Logic**: Built-in retry with exponential backoff
- **📝 Input Validation**: Prevent invalid requests before they're sent
- **🛡️ Error Handling**: Structured error responses that work with library error boundaries
- **🌐 Framework Agnostic**: Use the same procedures across React, Vue, Svelte, etc.

## Comparison with Other Solutions

| Feature                             | Composable HTTP Client            | Axios                   | Native Fetch             |
| ----------------------------------- | --------------------------------- | ----------------------- | ------------------------ |
| **Type Safety**                     | ✅ End-to-end with Zod            | ❌ Manual typing        | ❌ No typing             |
| **Input Validation**                | ✅ Built-in with schemas          | ❌ Manual validation    | ❌ None                  |
| **Output Validation**               | ✅ Runtime validation             | ❌ No validation        | ❌ No validation         |
| **Retry Logic**                     | ✅ Built-in configurable          | 🔧 Plugin required      | ❌ Manual implementation |
| **Composability**                   | ✅ Procedure builders             | ❌ Not composable       | ❌ Not composable        |
| **Error Handling**                  | ✅ Structured & typed             | 🔧 Manual setup         | 🔧 Manual try/catch      |
| **Request/Response Transformation** | ✅ Built-in                       | ✅ Interceptors         | 🔧 Manual                |
| **Lifecycle Hooks**                 | ✅ onStart, onSuccess, onComplete | ❌ None                 | ❌ None                  |
| **Interceptors**                    | ❌ None (has lifecycle hooks)     | ✅ Full interceptor API | ❌ None                  |
| **Browser Support**                 | ✅ Modern browsers                | ✅ IE11+                | ✅ Modern browsers       |
| **Node.js Support**                 | ✅ 20+                            | ✅ All versions         | ✅ 18+ (native)          |
| **Learning Curve**                  | 📚 Medium                         | 📚 Low                  | 📚 Low                   |

## Migration Guides

### From Axios

**Before (Axios)**:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshToken();
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

// Usage
const getUser = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};
```

**After (Composable HTTP Client)**:

```typescript
import { createHttpClient } from 'composable-http-client/axios';
import { createHttpClientProcedure } from 'composable-http-client';
import { z } from 'zod';

const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: tokens => ({
    'Content-Type': 'application/json',
    ...(tokens.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
  }),
  getTokens: () => ({
    accessToken: localStorage.getItem('token') || '',
  }),
  refreshToken: async () => {
    await refreshToken();
  },
});

const procedure = createHttpClientProcedure(client);

const getUser = procedure()
  .input(z.object({ userId: z.string() }))
  .handler(async ({ input, client }) => {
    return client.get(`/users/${input.userId}`);
  })
  .output(userSchema)
  .retry({ retries: 3, delay: 1000 })
  .catchAll(error => ({
    error: error.message,
    code: error.response?.status,
  }));
```

### From Manual Fetch

**Before (Manual Fetch)**:

```typescript
const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

// Manual retry logic
const fetchWithRetry = async (userId: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchUser(userId);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

**After (Composable HTTP Client)**:

```typescript
import { createHttpClient } from 'composable-http-client/fetch';
import { createHttpClientProcedure } from 'composable-http-client';
import { z } from 'zod';

const client = createHttpClient({
  baseURL: '/api',
  headers: tokens => ({
    'Content-Type': 'application/json',
    ...(tokens.accessToken && { Authorization: `Bearer ${tokens.accessToken}` }),
  }),
  getTokens: () => ({
    accessToken: getToken(),
  }),
});

const procedure = createHttpClientProcedure(client);

const getUser = procedure()
  .input(z.object({ userId: z.string() }))
  .handler(async ({ input, client }) => {
    return client.get(`/users/${input.userId}`);
  })
  .output(userSchema)
  .retry({
    retries: 3,
    delay: attempt => 1000 * Math.pow(2, attempt),
  })
  .catchAll(error => ({
    error: error.message,
    status: error.response?.status,
  }));

// Usage with type safety and validation
const result = await getUser({ userId: '123' });
if (result.error) {
  console.error('Error:', result.error);
} else {
  console.log('User:', result.data); // Fully typed!
}
```

## FAQ

### General Usage

**Q: Can I use this library without Zod validation?**

A: Yes! While Zod is included as a dependency, you can skip the `.input()` and `.output()` methods and just use `.handler()` and `.catchAll()` for runtime functionality without validation.

```typescript
const getUser = procedure()
  .handler(async ({ client }) => {
    return client.get('/users/123');
  })
  .catchAll(error => ({ error: error.message }));
```

**Q: Which HTTP adapter should I choose?**

A:

- **Fetch adapter**: Use for modern environments (Node.js 20+, modern browsers) when you want the smallest bundle size
- **Axios adapter**: Use for maximum compatibility, better error handling, and when you need advanced HTTP features

**Q: Can I use multiple HTTP clients in the same application?**

A: Absolutely! You can create different clients for different APIs:

```typescript
const authClient = createHttpClient({ baseURL: 'https://auth.api.com' });
const dataClient = createHttpClient({ baseURL: 'https://data.api.com' });

const authProcedure = createHttpClientProcedure(authClient);
const dataProcedure = createHttpClientProcedure(dataClient);
```

### Type Safety

**Q: How do I handle dynamic response shapes?**

A: Use dynamic output schemas:

```typescript
.output(({ input }) => {
  return input.detailed ? detailedSchema : basicSchema;
})
```

**Q: Can I extend procedures with additional context?**

A: Yes, use `extendProcedure`:

```typescript
const baseProcedure = createHttpClientProcedure(client);
const authProcedure = extendProcedure(baseProcedure).handler(() => ({ user: getCurrentUser() }));
```

**Q: What's the difference between lifecycle hooks and interceptors?**

A: Lifecycle hooks are procedure-level callbacks that run at specific points in the procedure execution:

- **Lifecycle hooks**: Procedure-specific, run for that specific procedure call
- **Interceptors**: Client-level, run for all requests through that HTTP client

```typescript
// Lifecycle hooks (procedure-level)
const getUser = procedure()
  .onStart(() => console.log('This procedure started'))
  .handler(({ client }) => client.get('/users/1'))
  .onSuccess(() => console.log('This procedure succeeded'));

// For interceptor-like behavior, use the underlying HTTP client's capabilities
const client = createHttpClient({
  // This runs for ALL requests through this client
  logError: async error => console.log('Global error:', error),
});
```

### Error Handling

**Q: How do I handle different types of errors?**

A: Use structured error handling in `.catchAll()`:

```typescript
.catchAll((error) => {
  if (error instanceof z.ZodError) {
    return { type: 'VALIDATION_ERROR', details: error.issues };
  }
  if (error.response?.status === 401) {
    return { type: 'AUTH_ERROR', message: 'Please log in' };
  }
  return { type: 'UNKNOWN_ERROR', message: error.message };
})
```

**Q: How do I implement global error handling?**

A: Use the `logError` option in client configuration:

```typescript
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  logError: async error => {
    // Send to monitoring service
    errorReporter.capture(error);
  },
});
```

### Performance

**Q: How do I implement caching?**

A: You can implement caching in the handler:

```typescript
const cache = new Map();

.handler(async ({ input, client }) => {
  const cacheKey = JSON.stringify(input);

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = await client.get('/data');
  cache.set(cacheKey, result);
  return result;
})
```

**Q: What's the bundle size impact?**

A:

- Core library: ~3.2KB gzipped
- With Zod: ~12.4KB gzipped total (Zod adds ~9KB)
- Axios adapter: +0.4KB gzipped
- Fetch adapter: +0.6KB gzipped
- Error classes: +0.8KB gzipped (optional import)

### Testing

**Q: How do I test procedures?**

A: Mock the HTTP client:

```typescript
const mockClient = {
  get: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
};

const procedure = createHttpClientProcedure(mockClient);
const getUser = procedure().handler(/*...*/).catchAll(/*...*/);

const result = await getUser({ userId: '1' });
expect(mockClient.get).toHaveBeenCalledWith('/users/1');
```

**Q: How do I test with MSW?**

A: Set up MSW handlers and use real HTTP client:

```typescript
const server = setupServer(
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Test User' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our development process.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

MIT License - see the [LICENSE](LICENSE) file for details.
