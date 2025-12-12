import { BaseMiddleware, type MiddlewareContext, type MiddlewareResult } from './base';
import { logRequest } from './logging';

export class LoggingMiddleware extends BaseMiddleware {
    protected async process(context: MiddlewareContext): Promise<MiddlewareResult> {
        // Log the request
        await logRequest(context.event, context.clientIP);

        // Continue to next middleware
        return { continue: true };
    }
}