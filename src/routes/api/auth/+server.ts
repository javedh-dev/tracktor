import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import * as authService from '$server/services/authService';
import { env } from '$lib/config/env.server';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';
import { sessionCookieOptions } from '$server/utils/session-cookie';

// POST /api/auth - Login with username/password
export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Auth POST error:', async () => {
    const body = await event.request.json();

    // Validate request body
    if (!body.username || !body.password) {
      throw error(400, 'Username and password are required');
    }

    const result = await authService.loginUser(body.username, body.password);

    // Set session cookie
    if (result.sessionToken) {
      // 30 days; HTTPS is inferred from the trusted adapter URL or explicitly configured.
      event.cookies.set(
        'session',
        result.sessionToken,
        sessionCookieOptions(event.url, env.HTTP_MODE)
      );
    }

    return jsonResponse(result);
  });
};

// GET /api/auth - Get authentication status and validate session
export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Auth GET error:', async () => {
    const result = await authService.getUsersCount();
    const isAuthDisabled = env.DISABLE_AUTH;

    // Check if user has a valid session
    const sessionToken = event.cookies.get('session');
    let user = null;

    if (sessionToken) {
      try {
        const sessionResult = await authService.validateSession(sessionToken);
        user = sessionResult.user;
      } catch (err) {
        // Session is invalid, but don't throw error - just return null user
        console.error('Invalid session during auth check:', err);
      }
    }

    return jsonResponse({
      ...result,
      isAuthDisabled,
      user,
      isAuthenticated: isAuthDisabled || !!user
    });
  });
};

// DELETE /api/auth - Logout
export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Auth DELETE error:', async () => {
    const sessionToken = event.cookies.get('session');

    if (sessionToken) {
      // Get session ID from token for logout
      const { validateSessionToken } = await import('$server/utils/session');
      const { session } = await validateSessionToken(sessionToken);

      if (session) {
        await authService.logoutUser(session.id);
      }
    }

    // Clear session cookie with proper options
    // Expire immediately using the same cookie scope and security attributes as login.
    event.cookies.set('session', '', sessionCookieOptions(event.url, env.HTTP_MODE, true));

    return jsonResponse(undefined, 'Logout successful');
  });
};
