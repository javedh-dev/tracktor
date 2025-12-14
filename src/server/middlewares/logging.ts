import { logger } from '$server/config';
import type { RequestEvent } from '@sveltejs/kit';
import { BaseMiddleware, type MiddlewareResult } from './base';
import { env } from '$lib/config/env';

export class LoggingMiddleware extends BaseMiddleware {
    protected async process(event: RequestEvent): Promise<MiddlewareResult> {
        if (env.LOG_REQUESTS) {
            let message = `${event.getClientAddress()} - ${event.request.method} - ${event.url.pathname}`;
            logger.info(message);
        }

        return { continue: true };
    }
}