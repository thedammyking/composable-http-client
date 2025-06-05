import type { URL, HTTPMethod, StatusCode, Timeout, NonEmptyArray } from '../types/utility';
import type { RequestConfig } from '../types/base';

/**
 * Runtime type guards for comprehensive type checking
 */

export function isValidURL(value: unknown): value is URL {
  if (typeof value !== 'string') return false;
  try {
    new globalThis.URL(value);
    return true;
  } catch {
    return false;
  }
}

const VALID_HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

export function isValidHTTPMethod(value: unknown): value is HTTPMethod {
  return (
    typeof value === 'string' &&
    VALID_HTTP_METHODS.includes(value.toUpperCase() as (typeof VALID_HTTP_METHODS)[number])
  );
}

export function isValidStatusCode(value: unknown): value is StatusCode {
  return typeof value === 'number' && value >= 100 && value <= 599;
}

export function isValidTimeout(value: unknown): value is Timeout {
  return typeof value === 'number' && value > 0 && value <= 300000; // max 5 minutes
}

export function isNonEmptyArray<T>(value: unknown): value is NonEmptyArray<T> {
  return Array.isArray(value) && value.length > 0;
}

export function isValidHeaders(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null) return false;

  return Object.entries(value).every(
    ([key, val]) => typeof key === 'string' && typeof val === 'string'
  );
}

export function isValidRequestConfig(value: unknown): value is RequestConfig {
  if (typeof value !== 'object' || value === null) return false;

  const config = value as Record<string, unknown>;

  // Check required fields
  if (config['url'] !== undefined && typeof config['url'] !== 'string') return false;
  if (config['method'] !== undefined && !isValidHTTPMethod(config['method'])) return false;
  if (config['headers'] !== undefined && !isValidHeaders(config['headers'])) return false;
  if (config['timeout'] !== undefined && !isValidTimeout(config['timeout'])) return false;

  return true;
}

/**
 * Type assertion functions that throw errors for invalid types
 */
export function assertValidURL(value: unknown, context?: string): asserts value is URL {
  if (!isValidURL(value)) {
    const contextMsg = context !== null && context !== undefined ? ` in ${context}` : '';
    throw new TypeError(`Expected valid URL${contextMsg}, got: ${value}`);
  }
}

export function assertValidHTTPMethod(
  value: unknown,
  context?: string
): asserts value is HTTPMethod {
  if (!isValidHTTPMethod(value)) {
    const contextMsg = context !== null && context !== undefined ? ` in ${context}` : '';
    throw new TypeError(`Expected valid HTTP method${contextMsg}, got: ${value}`);
  }
}

export function assertValidStatusCode(
  value: unknown,
  context?: string
): asserts value is StatusCode {
  if (!isValidStatusCode(value)) {
    const contextMsg = context !== null && context !== undefined ? ` in ${context}` : '';
    throw new TypeError(`Expected valid status code${contextMsg}, got: ${value}`);
  }
}

export function assertValidTimeout(value: unknown, context?: string): asserts value is Timeout {
  if (!isValidTimeout(value)) {
    const contextMsg = context !== null && context !== undefined ? ` in ${context}` : '';
    throw new TypeError(`Expected valid timeout${contextMsg}, got: ${value}`);
  }
}

/**
 * Safe type conversion functions
 */
export function safeParseURL(value: unknown): URL | null {
  return isValidURL(value) ? value : null;
}

export function safeParseHTTPMethod(value: unknown): HTTPMethod | null {
  return isValidHTTPMethod(value) ? value : null;
}

export function safeParseStatusCode(value: unknown): StatusCode | null {
  return isValidStatusCode(value) ? value : null;
}

export function safeParseTimeout(value: unknown): Timeout | null {
  return isValidTimeout(value) ? value : null;
}
