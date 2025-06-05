# Contributing to Composable HTTP Client

We love your input! We want to make contributing to Composable HTTP Client as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/composable-http-client.git
   cd composable-http-client
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make your changes** and test them
6. **Submit a pull request**

## 📋 Development Setup

### Prerequisites

- **Node.js 20+** (we recommend using [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm))
- **pnpm 10+** (our preferred package manager)
- **Git** for version control

### Local Development

```bash
# Install dependencies
pnpm install

# Run tests in watch mode
pnpm test

# Run type checking
pnpm typecheck

# Build the project
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format
```

### Project Scripts

| Script                  | Description                  |
| ----------------------- | ---------------------------- |
| `pnpm dev`              | Build in watch mode          |
| `pnpm test`             | Run tests in watch mode      |
| `pnpm test:run`         | Run tests once               |
| `pnpm test:coverage`    | Run tests with coverage      |
| `pnpm lint`             | Run ESLint                   |
| `pnpm lint:fix`         | Fix ESLint issues            |
| `pnpm format`           | Format code with Prettier    |
| `pnpm format:check`     | Check code formatting        |
| `pnpm typecheck`        | Run TypeScript type checking |
| `pnpm typecheck:strict` | Run strict type checking     |
| `pnpm build`            | Build the library            |

## 🧪 Testing Requirements

### Writing Tests

- **All new features** must include comprehensive tests
- **Bug fixes** should include regression tests
- **Tests must pass** on all supported Node.js versions (20+)
- **Coverage threshold**: Maintain at least 80% coverage for new code

### Test Structure

```typescript
// tests/feature.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createHttpClientProcedure } from '../src/index';

describe('Feature Name', () => {
  let mockClient: any;
  let procedure: ReturnType<typeof createHttpClientProcedure>;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    procedure = createHttpClientProcedure(mockClient);
    vi.clearAllMocks();
  });

  it('should handle the expected behavior', async () => {
    // Arrange
    mockClient.get.mockResolvedValue({ id: 1, name: 'Test' });

    // Act
    const testProcedure = procedure()
      .input(z.object({ id: z.number() }))
      .handler(async ({ input, client }) => {
        return client.get(`/test/${input.id}`);
      })
      .catchAll(error => ({ error: error.message }));

    const result = await testProcedure({ id: 1 });

    // Assert
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ id: 1, name: 'Test' });
    expect(mockClient.get).toHaveBeenCalledWith('/test/1');
  });
});
```

### Test Categories

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test procedure builders with HTTP clients
3. **Type Tests**: Ensure TypeScript types work correctly
4. **Error Handling Tests**: Test error scenarios and edge cases

## 📝 Code Style Guidelines

### TypeScript Standards

Based on our ESLint configuration, we follow these standards:

#### Naming Conventions

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  displayName: string;
}

const getUserData = async (userId: string) => {
  /* ... */
};

// ❌ Bad
interface userprofile {
  ID: string;
  display_name: string;
}

const get_user_data = async (user_id: string) => {
  /* ... */
};
```

#### Type Definitions

```typescript
// ✅ Prefer interfaces over type aliases
interface ApiResponse<T> {
  data: T;
  status: number;
}

// ✅ Use readonly for immutable properties
interface ProcedureConfig {
  readonly retries: number;
  readonly timeout: number;
}

// ✅ Use const assertions
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;

// ❌ Avoid any types (use unknown instead)
const processData = (data: unknown) => {
  /* ... */
};
```

#### Function Signatures

```typescript
// ✅ Use arrow functions for simple operations
const formatUrl = (base: string, path: string) => `${base}${path}`;

// ✅ Use function declarations for complex logic
function createProcedureBuilder<TCtx, TClient>(
  ctx: TCtx,
  client: TClient
): ProcedureBuilder<TCtx, TClient> {
  // Complex implementation
}

// ✅ Prefer explicit return types for public APIs
export function createHttpClient(config: ClientConfig): HttpClient {
  return new HttpClientImpl(config);
}
```

### Code Organization

#### File Structure

```
src/
├── core/           # Core functionality
├── types/          # Type definitions
├── utils/          # Utility functions
├── axios.ts        # Axios adapter
├── fetch.ts        # Fetch adapter
└── index.ts        # Main exports
```

#### Import/Export Guidelines

```typescript
// ✅ Use type-only imports when appropriate
import type { ZodType } from 'zod';
import { z } from 'zod';

// ✅ Group imports logically
import type { ApiResponse } from './types';
import { validateInput } from './utils';
import { createClient } from './client';

// ✅ Use named exports for main functionality
export { createHttpClientProcedure } from './core';
export type { ProcedureBuilder } from './types';
```

### Documentation Standards

#### JSDoc Comments

````typescript
/**
 * Creates a procedure builder for composing HTTP operations.
 *
 * @template TCtx - The context type
 * @template TClient - The HTTP client type
 * @param client - The HTTP client instance
 * @returns A procedure builder with fluent API
 *
 * @example
 * ```typescript
 * const procedure = createHttpClientProcedure(client);
 * const getUser = procedure()
 *   .input(z.object({ id: z.string() }))
 *   .handler(async ({ input, client }) => {
 *     return client.get(`/users/${input.id}`);
 *   })
 *   .catchAll(error => ({ error: error.message }));
 * ```
 */
export function createHttpClientProcedure<TCtx, TClient>(
  client: TClient
): ProcedureBuilder<TCtx, TClient> {
  // Implementation
}
````

## 🐛 Reporting Bugs

We use GitHub issues to track bugs. Report a bug by [opening a new issue](https://github.com/yourusername/composable-http-client/issues/new?template=bug_report.md).

### Bug Report Guidelines

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Before Submitting a Bug Report

- **Check existing issues** to avoid duplicates
- **Try the latest version** to see if the issue persists
- **Provide minimal reproduction** cases
- **Include environment details** (Node.js version, OS, etc.)

## 💡 Proposing Features

We love feature proposals! Here's how to suggest a new feature:

1. **Check existing issues** to see if someone else has suggested it
2. **Open a discussion** or feature request issue
3. **Describe the problem** you're trying to solve
4. **Explain your proposed solution**
5. **Consider alternative solutions**
6. **Provide examples** of how the feature would be used

### Feature Request Template

````markdown
## Summary

Brief description of the feature

## Problem

What problem does this feature solve?

## Proposed Solution

How should this feature work?

## Examples

```typescript
// Example usage
const example = procedure().newFeature(/* configuration */).handler(/* ... */);
```
````

## Alternatives

What other solutions did you consider?

## Implementation Notes

Any technical considerations?

```

## 🎯 Good First Issues

New to the project? Look for issues labeled `good first issue`. These are:

- **Well-defined** with clear acceptance criteria
- **Scoped appropriately** for newcomers
- **Documented** with helpful context
- **Mentored** - maintainers will help guide you

### Types of Good First Issues

1. **Documentation improvements**
2. **Adding tests** for existing functionality
3. **Small bug fixes** with clear reproduction steps
4. **Code quality improvements** (refactoring, type safety)
5. **Developer experience** enhancements

## 🔄 Pull Request Process

### Before Submitting

1. **Fork the repo** and create your branch from `main`
2. **Add tests** for your changes
3. **Update documentation** if needed
4. **Ensure tests pass** locally
5. **Run linting** and fix any issues
6. **Write a clear commit message**

### Pull Request Guidelines

#### Title Format

```

type(scope): description

Examples:
feat(core): add retry delay function option
fix(axios): handle timeout errors correctly
docs(readme): update installation instructions
test(procedures): add edge case tests

````

#### Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Updated tests for changed functionality

## Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review of the code
- [ ] Commented code, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation
- [ ] No new warnings
- [ ] New dependencies are justified

## Related Issues
Closes #123
````

#### Code Review Process

1. **Automated checks** must pass (CI, tests, linting)
2. **At least one maintainer** must review and approve
3. **Address feedback** promptly and thoroughly
4. **Squash commits** if requested
5. **Rebase** on main if needed

## 🏗️ Architecture Guidelines

### Core Principles

1. **Composability**: Everything should be composable and reusable
2. **Type Safety**: Leverage TypeScript for compile-time and runtime safety
3. **Framework Agnostic**: Work in any JavaScript environment
4. **Performance**: Optimize for common use cases
5. **Developer Experience**: Prioritize ergonomics and discoverability

### Adding New Features

When adding new features, consider:

1. **Backward compatibility**: Don't break existing APIs
2. **Tree shaking**: Ensure features can be imported selectively
3. **Bundle size**: Keep the impact minimal
4. **TypeScript support**: Provide full type definitions
5. **Documentation**: Include examples and use cases

### Error Handling Strategy

```typescript
// ✅ Use structured error types
interface ValidationError {
  type: 'VALIDATION_ERROR';
  details: ZodIssue[];
}

interface NetworkError {
  type: 'NETWORK_ERROR';
  status?: number;
  message: string;
}

// ✅ Provide helpful error messages
const createError = (type: string, message: string, details?: unknown) => {
  const error = new Error(message);
  error.name = type;
  (error as any).details = details;
  return error;
};
```

## 👥 Community Guidelines

### Communication

- **Be respectful** and inclusive
- **Help others** learn and grow
- **Share knowledge** and experiences
- **Provide constructive feedback**
- **Assume positive intent**

### Getting Help

- **GitHub Discussions** for questions and ideas
- **Issues** for bugs and feature requests
- **Pull Requests** for code contributions
- **Documentation** for implementation details

## 🏆 Recognition

We use [All Contributors](https://allcontributors.org/) to recognize all types of contributions:

- 💻 Code
- 📖 Documentation
- 🐛 Bug reports
- 💡 Ideas
- 🤔 Answering questions
- ⚠️ Tests
- 🎨 Design
- 📢 Talks

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Maintainer Guidelines

### Decision Making

1. **Technical decisions** are made through discussion and consensus
2. **Breaking changes** require RFC process for major features
3. **Minor changes** can be decided by any maintainer
4. **Disputes** are resolved through majority vote

### Release Process

1. **Semantic versioning** following SemVer strictly
2. **Automated releases** using Release Please
3. **Changelog** automatically generated from conventional commits
4. **Testing** all releases on multiple Node.js versions

### Maintainer Responsibilities

- **Review PRs** in a timely manner
- **Maintain code quality** standards
- **Help contributors** succeed
- **Keep dependencies** up to date
- **Monitor security** vulnerabilities

---

**Thank you for contributing to Composable HTTP Client!** 🎉

Every contribution, no matter how small, makes a difference. We appreciate your time and effort in making this project better for everyone.
