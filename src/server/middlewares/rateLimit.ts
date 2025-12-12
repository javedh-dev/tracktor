import type { ApiResponse } from '$lib/response';
import { getCorsOrigin } from './cors';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 1000; // max requests per window

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
}

/**
 * Check rate limit for a given IP address
 */
export function checkRateLimit(ip: string): RateLimitResult {
    const now = Date.now();
    const key = ip;

    let entry = rateLimitStore.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
        entry = undefined;
        rateLimitStore.delete(key);
    }

    if (!entry) {
        entry = {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        };
        rateLimitStore.set(key, entry);
        return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
    }

    entry.count++;

    if (entry.count > RATE_LIMIT_MAX) {
        return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

/**
 * Handle rate limit exceeded response
 */
export function createRateLimitResponse(request: Request): Response {
    const errorResponse: ApiResponse = {
        success: false,
        message: 'Rate Limit Exceeded. Please try again later.',
        errors: []
    };

    return new Response(JSON.stringify(errorResponse), {
        status: 429,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': getCorsOrigin(request),
            'Access-Control-Allow-Credentials': 'true'
        }
    });
}