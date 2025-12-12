import { env, logger } from '../config/index';

/**
 * Log incoming requests with optional body logging
 */
export async function logRequest(event: { request: Request; url: URL }, clientIP: string): Promise<void> {
    if (!env.LOG_REQUESTS) {
        return;
    }

    let message = `${event.request.method} ${event.url.pathname} - IP: ${clientIP}`;

    // Log request body for non-GET requests (be careful with sensitive data)
    if (shouldLogRequestBody(event.request)) {
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

/**
 * Determine if request body should be logged
 */
function shouldLogRequestBody(request: Request): boolean {
    return (
        request.method !== 'GET' &&
        request.headers.get('content-type')?.includes('application/json') === true
    );
}