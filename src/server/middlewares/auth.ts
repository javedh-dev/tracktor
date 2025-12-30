import type { ApiResponse } from '$lib';
import { env } from '$lib/config/env.server';
import { BaseMiddleware, type MiddlewareResult } from './base';
import type { RequestEvent } from '@sveltejs/kit';
import { CorsMiddleware } from './cors';
import { AppError, Status } from '$server/exceptions/AppError';
import { validateSession, getUsersCount } from '$server/services/authService';

const BYPASS_PATHS = ['/api/auth', '/api/files/', '/api/health', '/api/config/branding'];

export class AuthMiddleware extends BaseMiddleware {
	protected async process(event: RequestEvent): Promise<MiddlewareResult> {
		if (!this.requiresAuth(event.url.pathname)) {
			return { continue: true };
		}
		return await this.handleAuthentication(event);
	}

	private async handleAuthentication(event: RequestEvent): Promise<MiddlewareResult> {
		// Check if any users exist in the system
		const usersStatus = await getUsersCount();
		if (!usersStatus.data.hasUsers) {
			return {
				response: this.createAuthErrorResponse(
					'No users found. Please create a user account first.',
					Status.BAD_REQUEST,
					event.request
				),
				continue: false
			};
		}

		// Check for session token in Authorization header or cookie
		const authHeader = event.request.headers.get('Authorization');
		const sessionToken = authHeader?.replace('Bearer ', '') || event.cookies.get('session');

		if (!sessionToken) {
			return {
				response: this.createAuthErrorResponse(
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
					response: this.createAuthErrorResponse(
						'Invalid or expired session. Please login again.',
						Status.UNAUTHORIZED,
						event.request
					),
					continue: false
				};
			}

			// Add user to locals for use in route handlers
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
				response: this.createAuthErrorResponse(message, statusCode, event.request, error as Error),
				continue: false
			};
		}
	}

	private requiresAuth(pathname: string): boolean {
		// Skip auth if disabled in config
		if (env.DISABLE_AUTH) {
			return false;
		}

		// Only apply auth for API endpoints
		if (!pathname.startsWith('/api')) {
			return false;
		}

		// Check if pathname should be bypassed
		return !BYPASS_PATHS.some((path) => pathname.startsWith(path));
	}

	private createAuthErrorResponse(
		message: string,
		status: number,
		request: Request,
		error?: Error
	): Response {
		const errorResponse: ApiResponse = {
			success: false,
			message,
			errors: error ? [error] : []
		};

		return new Response(JSON.stringify(errorResponse), {
			status,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': CorsMiddleware.getCorsOrigin(request),
				'Access-Control-Allow-Credentials': 'true'
			}
		});
	}
}
