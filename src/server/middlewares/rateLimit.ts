import type { RequestEvent } from '@sveltejs/kit';
import { BaseMiddleware, type MiddlewareResult } from './base';
import type { ApiResponse } from '$lib';
import { CorsMiddleware } from './cors';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 1000; // max requests per window

export class RateLimitMiddleware extends BaseMiddleware {
	private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

	protected async process(event: RequestEvent): Promise<MiddlewareResult> {
		let clientAddress: string;

		try {
			clientAddress = event.getClientAddress();
		} catch (error) {
			// Fallback to a default identifier when client address cannot be determined
			// This commonly happens in development or behind proxies
			clientAddress = 'unknown-client';
		}

		const isAllowed = this.checkRateLimit(clientAddress);

		if (!isAllowed) {
			return {
				response: this.createRateLimitResponse(event.request),
				continue: false
			};
		}

		return { continue: true };
	}

	private checkRateLimit(ip: string): boolean {
		const now = Date.now();
		const key = ip;

		let entry = this.rateLimitStore.get(key);
		// Clean up expired entries
		if (entry && now > entry.resetTime) {
			entry = undefined;
			this.rateLimitStore.delete(key);
		}
		// Add new entry
		if (!entry) {
			entry = {
				count: 1,
				resetTime: now + RATE_LIMIT_WINDOW
			};
			this.rateLimitStore.set(key, entry);
			return true;
		}
		// Increement count
		entry.count++;

		if (entry.count > RATE_LIMIT_MAX) {
			return false;
		}
		return true;
	}

	private createRateLimitResponse(request: Request): Response {
		const errorResponse: ApiResponse = {
			success: false,
			message: 'Rate Limit Exceeded. Please try again later.',
			errors: []
		};

		return new Response(JSON.stringify(errorResponse), {
			status: 429,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': CorsMiddleware.getCorsOrigin(request),
				'Access-Control-Allow-Credentials': 'true'
			}
		});
	}
}
