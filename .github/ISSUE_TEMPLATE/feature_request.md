---
name: 💡 Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: ['enhancement']
assignees: ''
---

## 💡 Feature Summary

**A clear and concise description of the feature you'd like to see implemented.**

## 🎯 Problem Statement

**What problem does this feature solve? Is your feature request related to a problem?**

A clear description of what the problem is. Ex. I'm always frustrated when [...]

## 🚀 Proposed Solution

**Describe the solution you'd like to see.**

A clear and concise description of what you want to happen.

## 💻 Code Example

**How would you like to use this feature?**

```typescript
import { createHttpClient } from 'composable-http-client/fetch';
import { createHttpClientProcedure } from 'composable-http-client';

const client = createHttpClient({ baseURL: '/api' });
const procedure = createHttpClientProcedure(client);

// Example of how the new feature would be used
const exampleProcedure = procedure()
  .input(z.object({ id: z.string() }))
  .newFeature(/* configuration */) // <-- Your proposed feature
  .handler(async ({ input, client }) => {
    return client.get(`/example/${input.id}`);
  })
  .catchAll(error => ({ error: error.message }));
```

## 🔄 Alternatives Considered

**Describe alternatives you've considered.**

A clear and concise description of any alternative solutions or features you've considered.

## 🏗️ Implementation Ideas

**Do you have ideas on how this could be implemented?**

- Technical approach suggestions
- API design considerations
- Potential challenges
- Breaking change considerations

## 📊 Use Cases

**Describe specific use cases for this feature:**

1. **Use Case 1**: Description of when and why this would be used
2. **Use Case 2**: Another scenario where this feature would be valuable
3. **Use Case 3**: Additional context or edge cases

## 🎨 API Design

**What would the ideal API look like?**

```typescript
// Proposed API design
interface NewFeatureConfig {
  // Configuration options
}

// Type definitions
type NewFeatureResult<T> = {
  // Return type shape
};

// Usage examples
const result = procedure()
  .newFeature({
    // configuration
  })
  .handler(/* ... */);
```

## 📋 Requirements

**What are the requirements for this feature?**

- [ ] Should work with both fetch and axios adapters
- [ ] Should maintain type safety
- [ ] Should be composable with existing features
- [ ] Should have comprehensive tests
- [ ] Should include documentation and examples
- [ ] Should be backward compatible

## 🌍 Framework Compatibility

**Which frameworks/environments should this work with?**

- [ ] Node.js
- [ ] Browser
- [ ] React/Next.js
- [ ] Vue/Nuxt
- [ ] Svelte/SvelteKit
- [ ] Deno
- [ ] React Native

## 📚 Documentation Needs

**What documentation would be needed?**

- [ ] API reference
- [ ] Usage examples
- [ ] Migration guide (if breaking)
- [ ] Framework integration examples
- [ ] TypeScript type definitions

## ⚡ Performance Considerations

**Are there any performance implications?**

- Bundle size impact
- Runtime performance
- Memory usage
- Compatibility with tree-shaking

## 🔗 Related Features

**Are there existing features this would interact with?**

- Input validation
- Output validation
- Retry logic
- Error handling
- Lifecycle hooks
- Extended procedures

## 📝 Additional Context

**Add any other context, screenshots, or examples about the feature request here.**

## 🏷️ Priority

**How important is this feature to you?**

- [ ] Nice to have
- [ ] Would be helpful
- [ ] Important for my use case
- [ ] Blocking my adoption of the library

## 📋 Checklist

- [ ] I have searched existing issues and discussions
- [ ] I have provided clear use cases
- [ ] I have considered alternative approaches
- [ ] I have thought about backward compatibility
- [ ] I have provided code examples of the proposed API
