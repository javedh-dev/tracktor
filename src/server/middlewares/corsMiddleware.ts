import { BaseMiddleware, type MiddlewareContext, type MiddlewareResult } from './base';
import { handleCorsOptions } from './cors';

export class CorsMiddleware extends BaseMiddleware {
    protected async process(context: MiddlewareContext): Promise<MiddlewareResult> {
        // Handle CORS preflight requests
        if (context.event.request.method === 'OPTIONS') {
            return {
                response: handleCorsOptions(context.event.request),
                continue: false
            };
        }

        // Continue to next middleware
        return { continue: true };
    }
}