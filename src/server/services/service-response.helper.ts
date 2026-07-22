import { AppError, Status } from '$server/exceptions/AppError';

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
