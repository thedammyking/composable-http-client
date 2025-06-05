# Composable HTTP Client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript-first composable HTTP client library with procedure builders, schema validation, and retry logic. Works seamlessly in both **Node.js** and **browser** environments.

## Features

- 🎯 **Composable**: Build complex HTTP procedures using a fluent API
- 🔒 **Type-safe**: Full TypeScript support with Zod schema validation
- 🔄 **Retry Logic**: Built-in retry mechanisms with customizable delays
- 🧪 **Dual HTTP Support**: Works with both Axios and native Fetch
- 🎣 **Lifecycle Hooks**: onStart, onSuccess, onComplete hooks
- 🔧 **Middleware Support**: Transform responses and handle errors
- 🌐 **Framework Agnostic**: Works in Node.js (18+) and all modern browsers
- 📦 **Multiple Formats**: Supports both CJS and ESM for maximum compatibility

## Installation

```bash
npm install composable-http-client
# or
pnpm add composable-http-client
# or
yarn add composable-http-client
```

## Quick Start

### Basic Usage with Axios

```typescript
import { createHttpClientProcedure } from 'composable-http-client';
import { createHttpClient } from 'composable-http-client/axios';
import { z } from 'zod';

// Create HTTP client
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  headers: { Authorization: 'Bearer your-token' },
});

// Create procedure
const procedure = createHttpClientProcedure(client);

// Define schemas
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

// Build a composable procedure
const getUser = procedure()
  .input(z.object({ userId: z.number() }))
  .onStart(() => console.log('Fetching user...'))
  .retry({ retries: 3, delay: 1000 })
  .handler(async ({ userId }) => {
    return client.get(`/users/${userId}`);
  })
  .output(userSchema)
  .onSuccess(() => console.log('User fetched successfully'))
  .catchAll(error => ({ error: error.message }));

// Use the procedure
const result = await getUser({ userId: 123 });
if (result.error) {
  console.error('Error:', result.error);
} else {
  console.log('User:', result.result);
}
```

### Basic Usage with Fetch (Node.js 18+ & Browsers)

```typescript
import { createHttpClientProcedure } from 'composable-http-client';
import { createHttpClient } from 'composable-http-client/fetch';

// Create HTTP client using native fetch (available in Node.js 18+ and all modern browsers)
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

- **Minimum version**: Node.js 18.0.0+
- **Axios adapter**: Full support with interceptors
- **Fetch adapter**: Uses built-in `fetch` API (Node.js 18+)
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

// For modern environments with native fetch (Node.js 18+, browsers)
import { createHttpClient } from 'composable-http-client/fetch';

// The core procedure builder works with any HTTP client
import { createHttpClientProcedure } from 'composable-http-client';
```

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
  delay: 1000 // or (attempt, error) => attempt * 1000
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

Both Axios and Fetch clients support:

```typescript
{
  baseURL: string;
  headers?: Record<string, string> | HeadersFn;
  getTokens?: () => Record<string, string>;
  refreshToken?: () => Promise<void>;
  logError?: (error: unknown) => Promise<void>;
  addTracing?: (context) => Promise<void>;
  timeout?: number;
}
```

### Advanced Features

#### Token Refresh

Automatically refresh tokens on 401 responses:

```typescript
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  getTokens: () => ({ token: getStoredToken() }),
  refreshToken: async () => {
    const newToken = await refreshAuthToken();
    storeToken(newToken);
  },
  headers: tokens => ({
    Authorization: `Bearer ${tokens.token}`,
  }),
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

const withAuth = extendProcedure(baseProcedure).handler(({ ctx, client }) => {
  // Add authentication context
  return { user: getCurrentUser(), client };
});

const authenticatedProcedure = withAuth()
  .handler(async ({ user, client }) => {
    return client.get(`/users/${user.id}/profile`);
  })
  .catchAll(error => ({ error: error.message }));
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build package
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format
```

## Releases

This package uses [release-please](https://github.com/googleapis/release-please) for automated releases. Releases are triggered automatically when changes are merged to the main branch, based on [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

- `feat:` for new features (minor version bump)
- `fix:` for bug fixes (patch version bump)
- `feat!:` or `fix!:` for breaking changes (major version bump)
- `docs:`, `chore:`, `test:`, etc. for other changes (no version bump)

## License

MIT
