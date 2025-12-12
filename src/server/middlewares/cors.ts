import { env } from '../config/index';

/**
 * Get appropriate CORS origin based on request origin and configured origins
 */
export function getCorsOrigin(request: Request): string {
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

/**
 * Handle CORS preflight requests
 */
export function handleCorsOptions(request: Request): Response {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': getCorsOrigin(request),
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-PIN',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400'
        }
    });
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: Response, request: Request): void {
    response.headers.set('Access-Control-Allow-Origin', getCorsOrigin(request));
    response.headers.set('Access-Control-Allow-Credentials', 'true');
}