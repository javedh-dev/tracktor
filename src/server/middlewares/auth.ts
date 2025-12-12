import { env, logger } from '../config/index';
import { getPinStatus, verifyPin } from '../services/authService';
import { AppError, Status } from '../exceptions/AppError';
import type { ApiResponse } from '$lib/response';
import { getCorsOrigin } from './cors';

const BYPASS_PATHS = ['/api/auth', '/api/files/'];

/**
 * Handle authentication for API routes
 */
export async function handleAuthentication(event: {
    request: Request;
    url: URL;
}): Promise<Response | null> {
    logger.info(`Authenticating request: ${event.request.method} ${event.url.pathname}`);

    // Check if path should bypass authentication
    if (shouldBypassAuth(event.url.pathname)) {
        return null; // Allow request to proceed
    }

    const pin = event.request.headers.get('x-user-pin');

    if (!pin) {
        return createAuthErrorResponse(
            'PIN is required in X-User-PIN header.',
            Status.BAD_REQUEST,
            event.request
        );
    }

    try {
        const user = await getPinStatus();
        if (!user.data.exists) {
            return createAuthErrorResponse(
                'PIN is not set. Please set the PIN first.',
                Status.BAD_REQUEST,
                event.request
            );
        }

        await verifyPin(pin);
        return null; // Authentication successful, allow request to proceed
    } catch (error) {
        let statusCode = Status.INTERNAL_SERVER_ERROR;
        let message = 'Authentication failed';

        if (error instanceof AppError) {
            statusCode = error.status;
            message = error.message;
        }

        return createAuthErrorResponse(message, statusCode, event.request, error as Error);
    }
}

/**
 * Check if authentication should be bypassed for the given path
 */
function shouldBypassAuth(pathname: string): boolean {
    return BYPASS_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Create standardized authentication error response
 */
function createAuthErrorResponse(
    message: string,
    status: number,
    request: Request,
    error?: Error
): Response {
    const errorResponse: ApiResponse = {
        success: false,
        message,
        errors: error ? [error] : []
    };

    return new Response(JSON.stringify(errorResponse), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': getCorsOrigin(request),
            'Access-Control-Allow-Credentials': 'true'
        }
    });
}

/**
 * Check if authentication is required for API routes
 */
export function requiresAuth(pathname: string): boolean {
    return pathname.startsWith('/api') && !env.DISABLE_AUTH;
}