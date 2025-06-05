---
name: ❓ Question
about: Ask a question about using the library
title: '[QUESTION] '
labels: ['question']
assignees: ''
---

## ❓ Question

**What would you like to know?**

A clear and concise description of your question.

## 🎯 What I'm Trying to Achieve

**Describe what you're trying to accomplish.**

- What is your end goal?
- What functionality are you trying to implement?
- What problem are you solving?

## 💻 Current Code

**Share the code you're currently working with:**

```typescript
import { createHttpClient } from 'composable-http-client/fetch';
import { createHttpClientProcedure } from 'composable-http-client';
import { z } from 'zod';

// Your current implementation
const client = createHttpClient({
  baseURL: 'https://api.example.com',
});

const procedure = createHttpClientProcedure(client);

const myProcedure = procedure()
  .input(
    z.object({
      /* ... */
    })
  )
  .handler(async ({ input, client }) => {
    // Your current handler
  })
  .catchAll(error => ({ error: error.message }));
```

## 🤔 Specific Questions

**What specific aspects would you like help with?**

- [ ] Setting up HTTP client configuration
- [ ] Input/output schema design
- [ ] Error handling patterns
- [ ] Retry logic configuration
- [ ] Framework integration (React, Vue, Svelte, etc.)
- [ ] TypeScript type issues
- [ ] Performance optimization
- [ ] Testing strategies
- [ ] Migration from another library
- [ ] Best practices
- [ ] Other: ******\_\_\_******

## 🔍 What I've Tried

**What have you already attempted?**

1. Tried approach A: ...
2. Looked at documentation section: ...
3. Searched for existing issues: ...
4. Attempted solution B: ...

## 🌍 Environment

**Your setup (if relevant):**

- **Package Version**: [e.g. 1.0.0]
- **HTTP Adapter**: [fetch/axios]
- **Framework**: [e.g. Next.js, Vue, Svelte, Node.js]
- **TypeScript Version**: [e.g. 5.0.0]

## 📚 Documentation References

**Have you checked these resources?**

- [ ] README.md
- [ ] Contributing Guide
- [ ] API Reference section
- [ ] Framework Integration examples
- [ ] FAQ section
- [ ] Existing GitHub issues
- [ ] StackBlitz examples

## 🔗 Related Resources

**Are there any related examples, tutorials, or discussions you've found?**

- Link 1: ...
- Link 2: ...

## 💡 Additional Context

**Any other information that might be helpful:**

- Is this for a specific use case or industry?
- Are there constraints or requirements to consider?
- Any error messages or unexpected behavior?
- Screenshots (if applicable)

## 🎯 Expected Answer Type

**What kind of help would be most useful?**

- [ ] Code example
- [ ] Explanation of concepts
- [ ] Link to documentation
- [ ] Best practice guidance
- [ ] Alternative approach suggestions
- [ ] Troubleshooting steps

## 📋 Checklist

- [ ] I have searched existing issues and discussions
- [ ] I have checked the documentation and FAQ
- [ ] I have provided relevant code examples
- [ ] I have clearly described what I'm trying to achieve
- [ ] I have mentioned what I've already tried
