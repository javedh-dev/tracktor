import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
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
import { ensureAppDirectories } from '$server/utils/fs';

const middlewareChain = new MiddlewareChain();

const envSnapshot = () => ({
	LOG_LEVEL: env.LOG_LEVEL,
	LOG_DIR: env.LOG_DIR,
	NODE_ENV: env.NODE_ENV,
	DB_PATH: env.DB_PATH,
	DEMO_MODE: env.DEMO_MODE,
	FORCE_DATA_SEED: env.FORCE_DATA_SEED
});

const logEnvSnapshot = () => {
	const snapshot = envSnapshot();

	Object.entries(snapshot).forEach(([key, value]) => logger.info(`${key}: ${String(value)}`));
};

let dbInitialized = false;

const initPromise = (async () => {
	if (dbInitialized) return;

	try {
		logger.info(appAsciiArt);
		logEnvSnapshot();
	} catch (error) {
		logger.error('Failed to log startup banner', error);
	}

	try {
		await ensureAppDirectories();
	} catch (error) {
		logger.error('Failed to create required application directories', error);

		const wrapped = new Error('Failed to create required application directories');

		(wrapped as any).cause = error;

		throw wrapped;
	}

	try {
		await initializeDatabase();
		dbInitialized = true;
		logger.info('Database initialization completed');
	} catch (error) {
		logger.error('Failed to initialize database', error);

		const wrapped = new Error('Failed to initialize database');

		(wrapped as any).cause = error;

		throw wrapped;
	}
})();

const buildMiddlewares = () => [
	new CorsMiddleware(),
	new AuthMiddleware(),
	new RateLimitMiddleware(),
	new LoggingMiddleware()
];

export const handleError: HandleServerError = async ({ error, event }) => {
	logError(error, event);

	const body = createErrorResponseBody(error);

	return { message: body.message || 'Internal server error' };
};

const originalHandle: Handle = async ({ event, resolve }) => {
	await initPromise;
	middlewareChain.init(buildMiddlewares());

	const middlewareResult = await middlewareChain.handle(event);

	if (middlewareResult.response) {
		return middlewareResult.response;
	}

	const response = await resolve(event);

	CorsMiddleware.addCorsHeaders(response, event.request);

	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle = sequence(originalHandle, handleParaglide);
