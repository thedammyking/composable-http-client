---
name: 🐛 Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: ['bug']
assignees: ''
---

## 🐛 Bug Description

**A clear and concise description of what the bug is.**

## 🔄 Steps to Reproduce

**Steps to reproduce the behavior:**

1. Create a procedure with '...'
2. Call it with input '...'
3. Observe the error '...'
4. See error

## ✅ Expected Behavior

**A clear and concise description of what you expected to happen.**

## ❌ Actual Behavior

**A clear and concise description of what actually happened.**

## 📝 Minimal Code Example

```typescript
import { createHttpClient } from 'composable-http-client/fetch';
import { createHttpClientProcedure } from 'composable-http-client';
import { z } from 'zod';

// Your minimal reproducible example here
const client = createHttpClient({
  baseURL: 'https://api.example.com',
});

const procedure = createHttpClientProcedure(client);

const buggyProcedure = procedure()
  .input(
    z.object({
      /* your input schema */
    })
  )
  .handler(async ({ input, client }) => {
    // Your handler code that causes the bug
  })
  .catchAll(error => ({ error: error.message }));

// The call that triggers the bug
const result = await buggyProcedure({
  /* your input */
});
```

## 🔍 Error Message/Stack Trace

```
Paste the full error message and stack trace here
```

## 🌍 Environment

**Please complete the following information:**

- **Package Version**: [e.g. 1.0.0]
- **HTTP Adapter**: [fetch/axios]
- **Node.js Version**: [e.g. 20.1.0]
- **TypeScript Version**: [e.g. 5.0.0]
- **Zod Version**: [e.g. 3.22.0]
- **Operating System**: [e.g. macOS 14.0, Windows 11, Ubuntu 22.04]
- **Framework**: [e.g. Next.js 14, Vite, Node.js]

## 📦 Package.json Dependencies

```json
{
  "dependencies": {
    "composable-http-client": "x.x.x",
    "zod": "x.x.x"
    // Include other relevant dependencies
  }
}
```

## 🧪 Additional Context

**Add any other context about the problem here.**

- Did this work in a previous version?
- Are you using any other HTTP libraries alongside this one?
- Any custom configurations or middleware?
- Network conditions (proxy, VPN, etc.)?

## 🔗 Related Issues

**Are there any related issues or discussions?**

## 📋 Checklist

- [ ] I have searched existing issues to avoid duplicates
- [ ] I have provided a minimal reproducible example
- [ ] I have included all relevant environment information
- [ ] I have tested with the latest version of the package
- [ ] I have checked the documentation and FAQ
