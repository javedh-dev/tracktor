import { env } from '$server/config';
import type { RequestEvent } from '@sveltejs/kit';
import { BaseMiddleware, type MiddlewareResult } from '.';

export class CorsMiddleware extends BaseMiddleware {
    protected async process(event: RequestEvent): Promise<MiddlewareResult> {
        // Handle CORS preflight requests
        if (event.request.method === 'OPTIONS') {
            return {
                response: this.handleCorsOptions(event.request),
                continue: false
            };
        }

        return { continue: true };
    }

    public static getCorsOrigin(request: Request): string {
        const requestOrigin = request.headers.get('origin');

        // If no origin header (e.g., same-origin requests), allow it
        if (!requestOrigin) {
            return '*';
        }

        // If wildcard is configured, allow any origin
        if (env.CORS_ORIGINS.includes('*')) {
            return '*';
        }

        // Check if request origin is in allowed origins
        if (env.CORS_ORIGINS.includes(requestOrigin)) {
            return requestOrigin;
        }

        // Default to first configured origin if request origin is not allowed
        return env.CORS_ORIGINS[0] || '*';
    }

    private handleCorsOptions(request: Request): Response {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': CorsMiddleware.getCorsOrigin(request),
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-PIN',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Max-Age': '86400'
            }
        });
    }

    public static addCorsHeaders(response: Response, request: Request): void {
        response.headers.set('Access-Control-Allow-Origin', CorsMiddleware.getCorsOrigin(request));
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
}