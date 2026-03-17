import { error } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { AppError } from '$server/exceptions/AppError';

export function rethrowRouteError(err: unknown, fallbackMessage = 'Internal server error'): never {
  if (err instanceof ZodError) {
    throw error(400, `Validation error: ${err.issues.map((issue) => issue.message).join(', ')}`);
  }

  if (err instanceof AppError) {
    throw error(err.status, err.message);
  }

  if (err instanceof Error && 'status' in err) {
    throw err;
  }

  throw error(500, fallbackMessage);
}

export async function withRouteErrorHandling<T>(
  label: string,
  handler: () => Promise<T>,
  fallbackMessage = 'Internal server error'
): Promise<T> {
  try {
    return await handler();
  } catch (err) {
    console.error(label, err);
    rethrowRouteError(err, fallbackMessage);
  }
}
