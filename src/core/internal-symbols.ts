// Internal symbols for controlled access to private fields
// These symbols are not exported publicly, ensuring only internal code can access them
export const INTERNAL_GET_CTX = Symbol('internal_get_ctx');
export const INTERNAL_GET_CLIENT = Symbol('internal_get_client');

// Type-safe interface for internal access - this interface is not exported publicly
export interface InternalProcedureAccess<TCtx = unknown, TClient = unknown> {
  [INTERNAL_GET_CTX](): TCtx;
  [INTERNAL_GET_CLIENT](): TClient;
}

// Type guard for checking internal access with proper generics
export function hasInternalAccess<TCtx = unknown, TClient = unknown>(
  obj: unknown
): obj is InternalProcedureAccess<TCtx, TClient> {
  return (
    (typeof obj === 'object' || typeof obj === 'function') &&
    obj !== null &&
    INTERNAL_GET_CTX in obj &&
    INTERNAL_GET_CLIENT in obj &&
    typeof (obj as Record<symbol, unknown>)[INTERNAL_GET_CTX] === 'function' &&
    typeof (obj as Record<symbol, unknown>)[INTERNAL_GET_CLIENT] === 'function'
  );
}

// Helper to safely add symbol methods with proper typing
export function addInternalAccess<T extends object, TCtx, TClient>(
  obj: T,
  ctx: TCtx,
  client: TClient
): T & InternalProcedureAccess<TCtx, TClient> {
  const result = obj as T & InternalProcedureAccess<TCtx, TClient>;
  result[INTERNAL_GET_CTX] = () => ctx;
  result[INTERNAL_GET_CLIENT] = () => client;
  return result;
}
