import { error, json, type RequestEvent } from '@sveltejs/kit';
import { z, ZodError } from 'zod';
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

export async function parseBody<T>(
  event: RequestEvent,
  schema: z.ZodType<T>,
  overrides?: Record<string, unknown>
): Promise<T> {
  const body = await event.request.json();
  const input = overrides ? { ...body, ...overrides } : body;
  const result = schema.safeParse(input);
  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => {
        const path = issue.path.length ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      })
      .join('; ');
    throw error(400, `Validation failed: ${messages}`);
  }
  return result.data;
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

export async function withJsonErrorHandling<T>(
  label: string,
  handler: () => Promise<T>,
  message: string,
  status = 500
): Promise<T | Response> {
  try {
    return await handler();
  } catch (err) {
    console.error(label, err);
    return json(
      {
        success: false,
        message
      },
      { status }
    );
  }
}
