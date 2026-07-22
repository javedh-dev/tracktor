import { logger } from '../config/index';
import { AppError } from '../exceptions/AppError';

function serializeError(error: unknown): { message: string; code?: number } {
  if (error instanceof AppError) {
    return { message: error.message, code: error.status };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: String(error) };
}

export function createErrorResponseBody(error: unknown): {
  success: false;
  error: { message: string; code?: number };
} {
  return {
    success: false,
    error: serializeError(error)
  };
}

export function logError(error: unknown, event: { request: Request; url: URL }): void {
  logger.error(`Error in ${event.request.method} - ${event.url.pathname}`, error);
}
