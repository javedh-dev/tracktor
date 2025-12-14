import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as authService from '$server/services/authService';
import { AppError } from '$server/exceptions/AppError';
import { env } from '$lib/config/env.server';

// POST /api/auth - Login with username/password
export const POST: RequestHandler = async (event) => {
	try {
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
	} catch (err) {
		console.error('Auth POST error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};

// GET /api/auth - Get authentication status and validate session
export const GET: RequestHandler = async (event) => {
	try {
		const result = await authService.getUsersCount();

		// Check if user has a valid session
		const sessionToken = event.cookies.get('session');
		let user = null;

		if (sessionToken) {
			try {
				const sessionResult = await authService.validateSession(sessionToken);
				user = sessionResult.user;
			} catch (err) {
				// Session is invalid, but don't throw error - just return null user
				console.log('Invalid session during auth check:', err);
			}
		}

		return json({
			...result,
			data: {
				...result.data,
				user,
				isAuthenticated: !!user
			}
		});
	} catch (err) {
		console.error('Auth GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		throw error(500, 'Internal server error');
	}
};

// DELETE /api/auth - Logout
export const DELETE: RequestHandler = async (event) => {
	try {
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
	} catch (err) {
		console.error('Auth DELETE error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		throw error(500, 'Internal server error');
	}
};
