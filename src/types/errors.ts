// Import the actual error classes from the errors module
import type {
  HttpError,
  TimeoutError,
  ValidationError,
  RetryError,
  TokenRefreshError,
  NetworkError,
  ConfigurationError,
} from '../errors';

/**
 * Union type of all possible error types
 */
export type ComposableHttpErrorType =
  | HttpError
  | TimeoutError
  | ValidationError
  | RetryError
  | TokenRefreshError
  | NetworkError
  | ConfigurationError;
