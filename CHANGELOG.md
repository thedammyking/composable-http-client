# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1](https://github.com/thedammyking/composable-http-client/compare/composable-http-client-v1.0.0...composable-http-client-v1.0.1) (2025-06-05)


### Bug Fixes

* improve error handling for 401 responses in Axios client; ([3e77aa6](https://github.com/thedammyking/composable-http-client/commit/3e77aa6ee0abf369655bb7037d913bb2a9c8afce))

## [1.0.0] - 2025-06-05

### Added

- Initial release of composable HTTP client library
- Support for both Axios and native Fetch adapters
- Composable procedure builders with fluent API
- Schema validation with Zod
- Built-in retry logic with customizable delays
- Lifecycle hooks (onStart, onSuccess, onComplete)
- Response transformation capabilities
- Token refresh and error handling
- TypeScript support with full type safety
- Dual package format (CJS and ESM)
