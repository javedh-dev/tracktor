import { env } from '$lib/config/env.server';
import type { Handle } from '@sveltejs/kit';
import { errorResponse } from './cors';
import { AppError, Status } from '$server/exceptions/AppError';
import { validateSession, getUsersCount } from '$server/services/authService';

const BYPASS_PATHS = ['/api/auth', '/api/health', '/api/config/branding'];

function requiresAuth(pathname: string): boolean {
  if (env.DISABLE_AUTH || !pathname.startsWith('/api')) {
    return false;
  }

  return !BYPASS_PATHS.some((path) => pathname.startsWith(path));
}

export const handleAuth: Handle = async ({ event, resolve }) => {
  if (!requiresAuth(event.url.pathname)) {
    return resolve(event);
  }

  const usersStatus = await getUsersCount();
  if (!usersStatus.hasUsers) {
    return errorResponse(
      'No users found. Please create a user account first.',
      Status.BAD_REQUEST,
      event.request
    );
  }

  const authHeader = event.request.headers.get('Authorization');
  const sessionToken = authHeader?.replace('Bearer ', '') || event.cookies.get('session');

  if (!sessionToken) {
    return errorResponse(
      'Session token is required. Please login first.',
      Status.UNAUTHORIZED,
      event.request
    );
  }

  try {
    const { user } = await validateSession(sessionToken);

    if (!user) {
      return errorResponse(
        'Invalid or expired session. Please login again.',
        Status.UNAUTHORIZED,
        event.request
      );
    }

    event.locals.user = user;
  } catch (error) {
    const isAppError = error instanceof AppError;

    return errorResponse(
      isAppError ? error.message : 'Authentication failed',
      isAppError ? error.status : Status.INTERNAL_SERVER_ERROR,
      event.request,
      error as Error
    );
  }

  return resolve(event);
};
