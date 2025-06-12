# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0](https://github.com/thedammyking/composable-http-client/compare/composable-http-client-v1.1.1...composable-http-client-v1.2.0) (2025-06-12)


### Features

* add optional baseURL support for fetch client ([215c75a](https://github.com/thedammyking/composable-http-client/commit/215c75a729a6fea694ac693f65c42c1083e91309))


### Bug Fixes

* allow optional input for callable procedures in builder and callable functions ([9a7add1](https://github.com/thedammyking/composable-http-client/commit/9a7add18a63982dd5abd726c0c1562bd41a9ebba))

## [1.1.1](https://github.com/thedammyking/composable-http-client/compare/composable-http-client-v1.1.0...composable-http-client-v1.1.1) (2025-06-06)


### Bug Fixes

* consolidate error handling by removing index.ts and updating entry point in vite.config.ts ([305a823](https://github.com/thedammyking/composable-http-client/commit/305a82300b03cbb726beaee3f4a091f90c4b3c30))

## [1.1.0](https://github.com/thedammyking/composable-http-client/compare/composable-http-client-v1.0.4...composable-http-client-v1.1.0) (2025-06-06)


### Features

* add modular entry points for error handling and enhance README documentation ([73c8522](https://github.com/thedammyking/composable-http-client/commit/73c8522c1b1cdad2dee3aa4d7de8c2c2d1dcf6b3))

## [1.0.4](https://github.com/thedammyking/composable-http-client/compare/composable-http-client-v1.0.3...composable-http-client-v1.0.4) (2025-06-05)


### Bug Fixes

* add CODECOV_TOKEN environment variable to build workflow for enhanced coverage reporting ([4d64689](https://github.com/thedammyking/composable-http-client/commit/4d6468906477912b10a2988f304d63acb10004cd))

## [1.0.3](https://github.com/thedammyking/composable-http-client/compare/composable-http-client-v1.0.2...composable-http-client-v1.0.3) (2025-06-05)


### Bug Fixes

* improve error handling for 401 responses in Axios client; ([3e77aa6](https://github.com/thedammyking/composable-http-client/commit/3e77aa6ee0abf369655bb7037d913bb2a9c8afce))
* improve release workflow with debugging and proper asset upload ([2ca48df](https://github.com/thedammyking/composable-http-client/commit/2ca48dfbfd523e64e0efcc836009858d06124114))

## [1.0.2](https://github.com/thedammyking/composable-http-client/compare/composable-http-client-v1.0.1...composable-http-client-v1.0.2) (2025-06-05)


### Bug Fixes

* improve error handling for 401 responses in Axios client; ([3e77aa6](https://github.com/thedammyking/composable-http-client/commit/3e77aa6ee0abf369655bb7037d913bb2a9c8afce))

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
