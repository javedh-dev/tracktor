import type { Handle, HandleServerError } from '@sveltejs/kit';
import { createErrorResponseBody, logError } from './server/utils/errorHandler';
import {
	CorsMiddleware,
	RateLimitMiddleware,
	AuthMiddleware,
	LoggingMiddleware
} from '$server/middlewares';
import { MiddlewareChain } from '$server/middlewares/base';
import { initializeDatabase } from '$server/db/init';
import { appAsciiArt, logger } from '$server/config';
import { env } from '$lib/config/env.server';

const middlewareChain = new MiddlewareChain();

// Initialize database once when the server starts
let dbInitialized = false;
const initPromise = (async () => {
	if (!dbInitialized) {
		try {
			logger.info(appAsciiArt);
			// Log environment variables without secrets in prettty print
			logger.info(
				'Environment variables: \n' +
					JSON.stringify(
						{
							LOG_LEVEL: env.LOG_LEVEL,
							LOG_DIR: env.LOG_DIR,
							NODE_ENV: env.NODE_ENV,
							DB_PATH: env.DB_PATH,
							DEMO_MODE: env.DEMO_MODE,
							FORCE_DATA_SEED: env.FORCE_DATA_SEED
						},
						null,
						2
					)
			);
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
	]);

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
