import type { ApiResponse } from '$lib';
import { env } from '$server/config';
import { BaseMiddleware, type MiddlewareResult } from './base';
import type { RequestEvent } from '@sveltejs/kit';
import { CorsMiddleware } from './cors';
import { AppError, Status } from '$server/exceptions/AppError';
import { getPinStatus, verifyPin } from '$server/services/authService';

const BYPASS_PATHS = ['/api/auth', '/api/files/'];

export class AuthMiddleware extends BaseMiddleware {

    protected async process(event: RequestEvent): Promise<MiddlewareResult> {
        if (!this.requiresAuth(event.url.pathname)) {
            return { continue: true };
        }

        return await this.handleAuthentication(event);
    }

    private async handleAuthentication(event: RequestEvent): Promise<MiddlewareResult> {
        const pin = event.request.headers.get('x-user-pin');
        if (!pin) {
            return {
                response: this.createAuthErrorResponse(
                    'PIN is required in X-User-PIN header.',
                    Status.BAD_REQUEST,
                    event.request
                ),
                continue: false
            }
        }

        try {
            const user = await getPinStatus();
            if (!user.data.exists) {
                return {
                    response: this.createAuthErrorResponse(
                        'PIN is not set. Please set the PIN first.',
                        Status.BAD_REQUEST,
                        event.request
                    ),
                    continue: false
                }
            }

            await verifyPin(pin);
            return { continue: true };
        } catch (error) {
            let statusCode = Status.INTERNAL_SERVER_ERROR;
            let message = 'Authentication failed';

            if (error instanceof AppError) {
                statusCode = error.status;
                message = error.message;
            }

            return {
                response: this.createAuthErrorResponse(message, statusCode, event.request, error as Error),
                continue: false
            };
        }
    }


    private requiresAuth(pathname: string): boolean {
        // Only apply auth for APPI endpoints
        return pathname.startsWith('/api')
            // Check if auth is enabled in config    
            || !env.DISABLE_AUTH
            // Chcek if pathname to be bypassed
            || BYPASS_PATHS.some(path => pathname.startsWith(path));
    }

    private createAuthErrorResponse(
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
                'Access-Control-Allow-Origin': CorsMiddleware.getCorsOrigin(request),
                'Access-Control-Allow-Credentials': 'true'
            }
        });
    }
}