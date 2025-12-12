import type { Handle, HandleServerError } from '@sveltejs/kit';
import { MiddlewareChain, addCorsHeaders } from './server/middlewares';
import { createErrorResponseBody, logError } from './server/utils/errorHandler';

// Create the middleware chain instance
const middlewareChain = new MiddlewareChain();

export const handle: Handle = async ({ event, resolve }) => {
	const clientIP = event.getClientAddress();

	// Execute the middleware chain
	const middlewareResponse = await middlewareChain.execute({
		event,
		clientIP
	});

	// If any middleware returned a response, return it immediately
	if (middlewareResponse) {
		return middlewareResponse;
	}

	// Continue with the normal request processing
	const response = await resolve(event);

	// Add CORS headers to all responses
	addCorsHeaders(response, event.request);

	return response;
};

export const handleError: HandleServerError = async ({ error, event }) => {
	logError(error, event);
	const body = createErrorResponseBody(error);

	return {
		message: body.message || 'Internal server error'
	};
};


