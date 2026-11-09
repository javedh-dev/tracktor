import { env } from '$lib/config/env.server';
import type { Handle } from '@sveltejs/kit';
import { errorResponse } from './cors';
import { AppError, Status } from '$server/exceptions/AppError';
import { validateSession } from '$server/services/authService';
import { SYSTEM_ACCESS } from '$server/services/access';

const PUBLIC_ENDPOINTS = new Set([
  'GET /api/auth',
  'POST /api/auth',
  'DELETE /api/auth',
  'POST /api/auth/register',
  'GET /api/auth/oidc/login',
  'GET /api/auth/oidc/callback',
  'GET /api/health',
  'GET /api/config/branding'
]);

export const handleAuth: Handle = async ({ event, resolve }) => {
  if (env.DISABLE_AUTH) {
    event.locals.user = SYSTEM_ACCESS;
    return resolve(event);
  }
  const path = event.url.pathname.slice(env.BASE_URL.length) || '/';
  const isPublic = PUBLIC_ENDPOINTS.has(`${event.request.method} ${path}`);
  const token =
    event.request.headers.get('Authorization')?.replace(/^Bearer /, '') ||
    event.cookies.get('session');
  if (token) {
    try {
      const { user } = await validateSession(token);
      if (user) event.locals.user = user;
    } catch (err) {
      if (!isPublic && path.startsWith('/api/')) {
        return errorResponse(
          err instanceof AppError ? err.message : 'Authentication failed',
          err instanceof AppError ? err.status : Status.INTERNAL_SERVER_ERROR,
          event.request
        );
      }
    }
  }
  if (path.startsWith('/api/') && !isPublic && !event.locals.user) {
    return errorResponse('Not authenticated', Status.UNAUTHORIZED, event.request);
  }
  return resolve(event);
};
