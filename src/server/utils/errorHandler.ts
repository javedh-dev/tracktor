import { logger } from '../config/index';
import { AppError } from '../exceptions/AppError';
import { AppValidationError } from '../exceptions/AppValidationError';
import type { ApiResponse } from '$lib/response';

/**
 * Create standardized error response body
 */
export function createErrorResponseBody(error: unknown): ApiResponse {
    if (error instanceof AppValidationError) {
        return {
            success: false,
            errors: error.errors as any,
            message: error.message
        };
    }

    if (error instanceof AppError) {
        return {
            success: false,
            errors: [error],
            message: error.message
        };
    }

    return {
        success: false,
        errors: [error as Error],
        message: (error as Error)?.message || 'Internal server error'
    };
}

/**
 * Log error with context information
 */
export function logError(error: unknown, event: { request: Request; url: URL }): void {
    logger.error(`Error in ${event.request.method} - ${event.url.pathname}`, error);
}