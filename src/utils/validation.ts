import type { ProcedureConfig } from '../types/config';
import { ConfigurationError } from '../errors';

export function validateConfig(config: ProcedureConfig): void {
  if (config.mainHandler === undefined || config.mainHandler === null) {
    throw new ConfigurationError(
      'Main handler is required. Call .handler() before making the procedure callable.',
      'mainHandler'
    );
  }
}

export async function executeLifecycleHook(
  hookFn: (() => void | Promise<void>) | undefined,
  hookName: string
): Promise<void> {
  if (hookFn === undefined || hookFn === null) return;

  try {
    await hookFn();
  } catch (error) {
    throw new Error(
      `Error in ${hookName} hook: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
