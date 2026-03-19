import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as authService from '$server/services/authService';
import { env } from '$lib/config/env.server';
import { withRouteErrorHandling } from '$server/utils/route-handler';

// POST /api/auth - Login with username/password
export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Auth POST error:', async () => {
    const body = event.locals.requestBody || (await event.request.json());

    // Validate request body
    if (!body.username || !body.password) {
      throw error(400, 'Username and password are required');
    }

    const result = await authService.loginUser(body.username, body.password);

    // Set session cookie
    if (result.data?.sessionToken) {
      event.cookies.set('session', result.data.sessionToken, {
        path: '/',
        httpOnly: true,
        secure: env.HTTP_MODE === 'https',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return json(result);
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

    return json({
      ...result,
      data: {
        ...result.data,
        isAuthDisabled,
        user,
        isAuthenticated: isAuthDisabled || !!user
      }
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
    event.cookies.set('session', '', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    });

    return json({
      success: true,
      message: 'Logout successful'
    });
  });
};
