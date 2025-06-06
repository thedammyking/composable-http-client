/**
 * Base error class for all composable-http-client errors
 */
export abstract class ComposableHttpError extends Error {
  public abstract readonly type: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * HTTP request failed with a specific status code
 */
export class HttpError extends ComposableHttpError {
  public readonly type = 'HTTP_ERROR' as const;
  public readonly response: {
    readonly status: number;
    readonly data: unknown;
    readonly headers?: Record<string, string>;
  };

  constructor(message: string, status: number, data: unknown, headers?: Record<string, string>) {
    super(message);
    this.response = headers !== undefined ? { status, data, headers } : { status, data };
  }

  /**
   * Check if this is a client error (4xx)
   */
  get isClientError(): boolean {
    return this.response.status >= 400 && this.response.status < 500;
  }

  /**
   * Check if this is a server error (5xx)
   */
  get isServerError(): boolean {
    return this.response.status >= 500;
  }

  /**
   * Check if this is a specific status code
   */
  hasStatus(status: number): boolean {
    return this.response.status === status;
  }
}

/**
 * Request timed out
 */
export class TimeoutError extends ComposableHttpError {
  public readonly type = 'TIMEOUT_ERROR' as const;
  public readonly timeout: number;

  constructor(timeout: number, message = `Request timed out after ${timeout}ms`) {
    super(message);
    this.timeout = timeout;
  }
}

/**
 * Schema validation failed (input or output)
 */
export class ValidationError extends ComposableHttpError {
  public readonly type = 'VALIDATION_ERROR' as const;
  public readonly validationType: 'input' | 'output';
  public readonly zodError?: unknown;

  constructor(validationType: 'input' | 'output', message: string, zodError?: unknown) {
    super(message);
    this.validationType = validationType;
    this.zodError = zodError;
  }
}

/**
 * All retry attempts exhausted
 */
export class RetryError extends ComposableHttpError {
  public readonly type = 'RETRY_ERROR' as const;
  public readonly attempts: number;
  public readonly lastError: Error;

  constructor(attempts: number, lastError: Error) {
    super(`All ${attempts} retry attempts failed. Last error: ${lastError.message}`);
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

/**
 * Token refresh failed
 */
export class TokenRefreshError extends ComposableHttpError {
  public readonly type = 'TOKEN_REFRESH_ERROR' as const;
  public readonly originalError: Error | undefined;

  constructor(message = 'Token refresh failed', originalError?: Error) {
    super(message);
    this.originalError = originalError;
  }
}

/**
 * Network-related error (connection failed, DNS resolution, etc.)
 */
export class NetworkError extends ComposableHttpError {
  public readonly type = 'NETWORK_ERROR' as const;
  public readonly originalError: Error | undefined;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.originalError = originalError;
  }
}

/**
 * Configuration or setup error
 */
export class ConfigurationError extends ComposableHttpError {
  public readonly type = 'CONFIGURATION_ERROR' as const;
  public readonly field: string | undefined;

  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
  }
}

/**
 * Type guard to check if an error is a ComposableHttpError
 */
export function isComposableHttpError(error: unknown): error is ComposableHttpError {
  return error instanceof ComposableHttpError;
}

/**
 * Type guard to check if an error is an HttpError
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/**
 * Type guard to check if an error is a TimeoutError
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if an error is a RetryError
 */
export function isRetryError(error: unknown): error is RetryError {
  return error instanceof RetryError;
}

/**
 * Type guard to check if an error is a TokenRefreshError
 */
export function isTokenRefreshError(error: unknown): error is TokenRefreshError {
  return error instanceof TokenRefreshError;
}

/**
 * Type guard to check if an error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard to check if an error is a ConfigurationError
 */
export function isConfigurationError(error: unknown): error is ConfigurationError {
  return error instanceof ConfigurationError;
}

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
