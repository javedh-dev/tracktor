import type { ApiResponse } from '$lib/response';
import { AppError, Status } from '$server/exceptions/AppError';

export function createSuccessResponse<T>(data?: T, message?: string): ApiResponse {
  return {
    success: true,
    data,
    message
  };
}

export function createFailureResponse<T>(message: string, data?: T): ApiResponse {
  return {
    success: false,
    data,
    message
  };
}

export function requireRecord<T>(
  record: T | null | undefined,
  message: string,
  status = Status.NOT_FOUND
): T {
  if (!record) {
    throw new AppError(message, status);
  }

  return record;
}
