import { BaseMiddleware, type MiddlewareContext, type MiddlewareResult } from './base';
import { handleAuthentication, requiresAuth } from './auth';

export class AuthMiddleware extends BaseMiddleware {
    protected async process(context: MiddlewareContext): Promise<MiddlewareResult> {
        // Check if authentication is required for this route
        if (!requiresAuth(context.event.url.pathname)) {
            return { continue: true };
        }

        // Perform authentication
        const authResult = await handleAuthentication(context.event);

        if (authResult) {
            return {
                response: authResult,
                continue: false
            };
        }

        // Authentication successful, continue
        return { continue: true };
    }
}