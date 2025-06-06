import type { ProcedureConfig } from '../types/config';

export function validateConfig(config: ProcedureConfig): void {
  if (config.mainHandler === undefined || config.mainHandler === null) {
    throw new Error(
      'Main handler is required. Call .handler() before making the procedure callable.'
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
