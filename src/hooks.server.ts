import type { Handle, HandleServerError } from '@sveltejs/kit';
import { createErrorResponseBody, logError } from './server/utils/errorHandler';
import { CorsMiddleware, RateLimitMiddleware, AuthMiddleware, LoggingMiddleware, BaseMiddleware, MiddlewareChain } from '$server/middlewares'

const middlewareChain = new MiddlewareChain();

export const handle: Handle = async ({ event, resolve }) => {

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


