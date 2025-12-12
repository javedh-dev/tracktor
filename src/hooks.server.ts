import type { Handle, HandleServerError } from '@sveltejs/kit';
import { createErrorResponseBody, logError } from './server/utils/errorHandler';
import { CorsMiddleware, RateLimitMiddleware, AuthMiddleware, LoggingMiddleware } from '$server/middlewares'
import { MiddlewareChain } from '$server/middlewares/base';
import { initializeDatabase } from '$server/db/init';
import { logger } from '$server/config';

const middlewareChain = new MiddlewareChain();

// Initialize database once when the server starts
let dbInitialized = false;
const initPromise = (async () => {
	if (!dbInitialized) {
		try {
			await initializeDatabase();
			dbInitialized = true;
			logger.info('Database initialization completed');
		} catch (error) {
			logger.error('Failed to initialize database on startup:', error);
			throw error;
		}
	}
})();

export const handle: Handle = async ({ event, resolve }) => {
	// Ensure database is initialized before handling any requests
	await initPromise;

	middlewareChain.init([
		new CorsMiddleware(),
		new AuthMiddleware(),
		new RateLimitMiddleware(),
		new LoggingMiddleware()
	])

	const result = await middlewareChain.handle(event);
	if (result.response) {
		return result.response;
	}

	const response = await resolve(event);

	// Add CORS headers to all responses
	CorsMiddleware.addCorsHeaders(response, event.request);

	return response;
};

export const handleError: HandleServerError = async ({ error, event }) => {
	logError(error, event);
	const body = createErrorResponseBody(error);

	return {
		message: body.message || 'Internal server error'
	};
};


