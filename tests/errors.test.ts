import { describe, it, expect } from 'vitest';
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
  isComposableHttpError,
} from '../src/errors';

describe('Error Types', () => {
  it('should create and identify HttpError correctly', () => {
    const error = new HttpError('Request failed', 404, { message: 'Not found' });

    expect(error.type).toBe('HTTP_ERROR');
    expect(error.response.status).toBe(404);
    expect(error.response.data).toEqual({ message: 'Not found' });
    expect(error.isClientError).toBe(true);
    expect(error.isServerError).toBe(false);
    expect(error.hasStatus(404)).toBe(true);
    expect(error.hasStatus(500)).toBe(false);

    expect(isHttpError(error)).toBe(true);
    expect(isComposableHttpError(error)).toBe(true);
    expect(isTimeoutError(error)).toBe(false);
  });

  it('should create and identify TimeoutError correctly', () => {
    const error = new TimeoutError(5000);

    expect(error.type).toBe('TIMEOUT_ERROR');
    expect(error.timeout).toBe(5000);
    expect(error.message).toBe('Request timed out after 5000ms');

    expect(isTimeoutError(error)).toBe(true);
    expect(isComposableHttpError(error)).toBe(true);
    expect(isHttpError(error)).toBe(false);
  });

  it('should create and identify ValidationError correctly', () => {
    const zodError = { issues: [{ message: 'Invalid type' }] };
    const error = new ValidationError('input', 'Validation failed', zodError);

    expect(error.type).toBe('VALIDATION_ERROR');
    expect(error.validationType).toBe('input');
    expect(error.zodError).toBe(zodError);

    expect(isValidationError(error)).toBe(true);
    expect(isComposableHttpError(error)).toBe(true);
    expect(isHttpError(error)).toBe(false);
  });

  it('should create and identify RetryError correctly', () => {
    const lastError = new Error('Network failure');
    const error = new RetryError(3, lastError);

    expect(error.type).toBe('RETRY_ERROR');
    expect(error.attempts).toBe(3);
    expect(error.lastError).toBe(lastError);
    expect(error.message).toBe('All 3 retry attempts failed. Last error: Network failure');

    expect(isRetryError(error)).toBe(true);
    expect(isComposableHttpError(error)).toBe(true);
    expect(isHttpError(error)).toBe(false);
  });

  it('should create and identify TokenRefreshError correctly', () => {
    const originalError = new Error('Token expired');
    const error = new TokenRefreshError('Custom message', originalError);

    expect(error.type).toBe('TOKEN_REFRESH_ERROR');
    expect(error.message).toBe('Custom message');
    expect(error.originalError).toBe(originalError);

    expect(isTokenRefreshError(error)).toBe(true);
    expect(isComposableHttpError(error)).toBe(true);
    expect(isHttpError(error)).toBe(false);
  });

  it('should create and identify NetworkError correctly', () => {
    const originalError = new Error('Connection refused');
    const error = new NetworkError('Network failed', originalError);

    expect(error.type).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Network failed');
    expect(error.originalError).toBe(originalError);

    expect(isNetworkError(error)).toBe(true);
    expect(isComposableHttpError(error)).toBe(true);
    expect(isHttpError(error)).toBe(false);
  });

  it('should create and identify ConfigurationError correctly', () => {
    const error = new ConfigurationError('Invalid baseURL', 'baseURL');

    expect(error.type).toBe('CONFIGURATION_ERROR');
    expect(error.message).toBe('Invalid baseURL');
    expect(error.field).toBe('baseURL');

    expect(isConfigurationError(error)).toBe(true);
    expect(isComposableHttpError(error)).toBe(true);
    expect(isHttpError(error)).toBe(false);
  });

  it('should handle HttpError with headers', () => {
    const headers = { 'content-type': 'application/json' };
    const error = new HttpError('Request failed', 500, null, headers);

    expect(error.response.headers).toEqual(headers);
  });

  it('should handle HttpError without headers', () => {
    const error = new HttpError('Request failed', 500, null);

    expect(error.response.headers).toBeUndefined();
  });

  it('should properly identify server vs client errors', () => {
    const clientError = new HttpError('Bad Request', 400, null);
    const serverError = new HttpError('Internal Server Error', 500, null);

    expect(clientError.isClientError).toBe(true);
    expect(clientError.isServerError).toBe(false);

    expect(serverError.isClientError).toBe(false);
    expect(serverError.isServerError).toBe(true);
  });

  it('should return false for type guards with non-matching errors', () => {
    const regularError = new Error('Regular error');

    expect(isHttpError(regularError)).toBe(false);
    expect(isTimeoutError(regularError)).toBe(false);
    expect(isValidationError(regularError)).toBe(false);
    expect(isRetryError(regularError)).toBe(false);
    expect(isTokenRefreshError(regularError)).toBe(false);
    expect(isNetworkError(regularError)).toBe(false);
    expect(isConfigurationError(regularError)).toBe(false);
    expect(isComposableHttpError(regularError)).toBe(false);
  });
});
