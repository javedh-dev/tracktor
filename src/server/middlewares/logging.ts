import { env, logger } from '$server/config';
import type { RequestEvent } from '@sveltejs/kit';
import { BaseMiddleware, type MiddlewareResult } from '.';

export class LoggingMiddleware extends BaseMiddleware {
    protected async process(event: RequestEvent): Promise<MiddlewareResult> {
        if (env.LOG_REQUESTS) {
            let message = `${event.request.method} ${event.url.pathname} - IP: ${event.getClientAddress()}`;

            if (this.shouldLogRequestBody(event.request)) {
                try {
                    const body = await event.request.json();
                    if (body) {
                        message += ` - Body:\n${body}`;
                    }
                } catch (err) {
                    // Ignore body logging errors
                }
            }

            logger.info(message);
        }

        return { continue: true };
    }


    private shouldLogRequestBody(request: Request): boolean {
        return (
            request.method !== 'GET' &&
            request.headers.get('content-type')?.includes('application/json') === true
        );
    }
}