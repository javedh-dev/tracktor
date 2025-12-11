import type { Handle, HandleServerError } from '@sveltejs/kit';
import { env, logger } from '$lib/../server/config/index';
import { getPinStatus, verifyPin } from '$lib/../server/services/authService';
import { AppError, Status } from '$lib/../server/exceptions/AppError';
import { AppValidationError } from '$lib/../server/exceptions/AppValidationError';
import type { ApiResponse } from '$lib/response';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 1000; // max requests per window

export const handle: Handle = async ({ event, resolve }) => {
	// CORS handling
	if (event.request.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': getCorsOrigin(event.request),
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-PIN',
				'Access-Control-Allow-Credentials': 'true',
				'Access-Control-Max-Age': '86400'
			}
		});
	}

	// Rate limiting
	const clientIP = event.getClientAddress();
	const rateLimitResult = checkRateLimit(clientIP);
	if (!rateLimitResult.allowed) {
		return new Response(
			JSON.stringify({
				success: false,
				message: 'Rate Limit Exceeded. Please try again later.',
				errors: []
			} as ApiResponse),
			{
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': getCorsOrigin(event.request),
					'Access-Control-Allow-Credentials': 'true'
				}
			}
		);
	}

	// Request logging
	if (env.LOG_REQUESTS) {
		let message = `${event.request.method} ${event.url.pathname} - IP: ${clientIP}`;

		// Log request body for non-GET requests (be careful with sensitive data)
		if (
			event.request.method !== 'GET' &&
			event.request.headers.get('content-type')?.includes('application/json')
		) {
			try {
				const body = await event.request.clone().text();
				if (body) {
					message += ` - Body: ${body}`;
				}
			} catch (err) {
				// Ignore body logging errors
			}
		}

		logger.info(message);
	}

	// Authentication for API routes
	if (event.url.pathname.startsWith('/api') && !env.DISABLE_AUTH) {
		const authResult = await handleAuthentication(event);
		if (authResult) {
			return authResult; // Return error response
		}
	}

	const response = await resolve(event);

	// Add CORS headers to all responses
	response.headers.set('Access-Control-Allow-Origin', getCorsOrigin(event.request));
	response.headers.set('Access-Control-Allow-Credentials', 'true');

	return response;
};

export const handleError: HandleServerError = async ({ error, event }) => {
	logger.error(`Error in ${event.request.method} - ${event.url.pathname}`, error);

	let body: ApiResponse;

	if (error instanceof AppValidationError) {
		body = {
			success: false,
			errors: error.errors as any,
			message: error.message
		};
	} else if (error instanceof AppError) {
		body = {
			success: false,
			errors: [error],
			message: error.message
		};
	} else {
		body = {
			success: false,
			errors: [error as Error],
			message: (error as Error)?.message || 'Internal server error'
		};
	}

	return {
		message: body.message || 'Internal server error'
	};
};

/**
 * Get appropriate CORS origin based on request origin and configured origins
 */
function getCorsOrigin(request: Request): string {
	const requestOrigin = request.headers.get('origin');

	// If no origin header (e.g., same-origin requests), allow it
	if (!requestOrigin) {
		return '*';
	}

	// If wildcard is configured, allow any origin
	if (env.CORS_ORIGINS.includes('*')) {
		return '*';
	}

	// Check if request origin is in allowed origins
	if (env.CORS_ORIGINS.includes(requestOrigin)) {
		return requestOrigin;
	}

	// Default to first configured origin if request origin is not allowed
	return env.CORS_ORIGINS[0] || '*';
}

/**
 * Check rate limit for a given IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
	const now = Date.now();
	const key = ip;

	let entry = rateLimitStore.get(key);

	// Clean up expired entries
	if (entry && now > entry.resetTime) {
		entry = undefined;
		rateLimitStore.delete(key);
	}

	if (!entry) {
		entry = {
			count: 1,
			resetTime: now + RATE_LIMIT_WINDOW
		};
		rateLimitStore.set(key, entry);
		return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
	}

	entry.count++;

	if (entry.count > RATE_LIMIT_MAX) {
		return { allowed: false, remaining: 0 };
	}

	return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

/**
 * Handle authentication for API routes
 */
async function handleAuthentication(event: {
	request: Request;
	url: URL;
}): Promise<Response | null> {
	const bypassPaths = ['/api/auth/', '/api/files/'];

	// Check if path should bypass authentication
	for (const path of bypassPaths) {
		if (event.url.pathname.startsWith(path)) {
			return null; // Allow request to proceed
		}
	}

	const pin = event.request.headers.get('x-user-pin');

	if (!pin) {
		const errorResponse: ApiResponse = {
			success: false,
			message: 'PIN is required in X-User-PIN header.',
			errors: []
		};

		return new Response(JSON.stringify(errorResponse), {
			status: Status.BAD_REQUEST,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': getCorsOrigin(event.request),
				'Access-Control-Allow-Credentials': 'true'
			}
		});
	}

	try {
		const user = await getPinStatus();
		if (!user.data.exists) {
			const errorResponse: ApiResponse = {
				success: false,
				message: 'PIN is not set. Please set the PIN first.',
				errors: []
			};

			return new Response(JSON.stringify(errorResponse), {
				status: Status.BAD_REQUEST,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': getCorsOrigin(event.request),
					'Access-Control-Allow-Credentials': 'true'
				}
			});
		}

		await verifyPin(pin);
		return null; // Authentication successful, allow request to proceed
	} catch (error) {
		let statusCode = Status.INTERNAL_SERVER_ERROR;
		let message = 'Authentication failed';

		if (error instanceof AppError) {
			statusCode = error.status;
			message = error.message;
		}

		const errorResponse: ApiResponse = {
			success: false,
			message,
			errors: [error as Error]
		};

		return new Response(JSON.stringify(errorResponse), {
			status: statusCode,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': getCorsOrigin(event.request),
				'Access-Control-Allow-Credentials': 'true'
			}
		});
	}
}
