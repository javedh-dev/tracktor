import { env } from '$lib/config/env.server';
import { BaseMiddleware, type MiddlewareResult } from './base';
import type { RequestEvent } from '@sveltejs/kit';
import { CorsMiddleware } from './cors';
import { AppError, Status } from '$server/exceptions/AppError';
import { validateSession, getUsersCount } from '$server/services/authService';

const BYPASS_PATHS = ['/api/auth', '/api/health', '/api/config/branding'];

export class AuthMiddleware extends BaseMiddleware {
  protected async process(event: RequestEvent): Promise<MiddlewareResult> {
    if (!this.requiresAuth(event.url.pathname)) {
      return { continue: true };
    }
    return await this.handleAuthentication(event);
  }

  private async handleAuthentication(event: RequestEvent): Promise<MiddlewareResult> {
    const usersStatus = await getUsersCount();
    if (!usersStatus.hasUsers) {
      return {
        response: CorsMiddleware.createErrorResponse(
          'No users found. Please create a user account first.',
          Status.BAD_REQUEST,
          event.request
        ),
        continue: false
      };
    }

    const authHeader = event.request.headers.get('Authorization');
    const sessionToken = authHeader?.replace('Bearer ', '') || event.cookies.get('session');

    if (!sessionToken) {
      return {
        response: CorsMiddleware.createErrorResponse(
          'Session token is required. Please login first.',
          Status.UNAUTHORIZED,
          event.request
        ),
        continue: false
      };
    }

    try {
      const { user } = await validateSession(sessionToken);

      if (!user) {
        return {
          response: CorsMiddleware.createErrorResponse(
            'Invalid or expired session. Please login again.',
            Status.UNAUTHORIZED,
            event.request
          ),
          continue: false
        };
      }

      event.locals.user = user;
      return { continue: true };
    } catch (error) {
      let statusCode = Status.INTERNAL_SERVER_ERROR;
      let message = 'Authentication failed';

      if (error instanceof AppError) {
        statusCode = error.status;
        message = error.message;
      }

      return {
        response: CorsMiddleware.createErrorResponse(
          message,
          statusCode,
          event.request,
          error as Error
        ),
        continue: false
      };
    }
  }

  private requiresAuth(pathname: string): boolean {
    if (env.DISABLE_AUTH) {
      return false;
    }

    if (!pathname.startsWith('/api')) {
      return false;
    }

    return !BYPASS_PATHS.some((path) => pathname.startsWith(path));
  }
}
