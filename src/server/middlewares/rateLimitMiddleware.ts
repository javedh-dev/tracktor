import { BaseMiddleware, type MiddlewareContext, type MiddlewareResult } from './base';
import { checkRateLimit, createRateLimitResponse } from './rateLimit';

export class RateLimitMiddleware extends BaseMiddleware {
    protected async process(context: MiddlewareContext): Promise<MiddlewareResult> {
        const rateLimitResult = checkRateLimit(context.clientIP);

        if (!rateLimitResult.allowed) {
            return {
                response: createRateLimitResponse(context.event.request),
                continue: false
            };
        }

        // Continue to next middleware
        return { continue: true };
    }
}