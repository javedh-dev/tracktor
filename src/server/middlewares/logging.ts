import { logger } from '$server/config';
import type { RequestEvent } from '@sveltejs/kit';
import { BaseMiddleware, type MiddlewareResult } from './base';
import { env } from '$lib/config/env.server';

export class LoggingMiddleware extends BaseMiddleware {
	protected async process(event: RequestEvent): Promise<MiddlewareResult> {
		if (env.LOG_REQUESTS) {
			let message = `${this.getNormalizedIPv4Address(this.getClientAddress(event))} - ${event.request.method} - ${event.url.pathname}`;
			logger.info(message);
		}

		return { continue: true };
	}

	private getClientAddress(event: RequestEvent): string {
		const forwardedFor = event.request.headers.get('x-forwarded-for');
		if (forwardedFor) {
			return forwardedFor.split(',')[0].trim();
		}
		return event.getClientAddress();
	}

	private getNormalizedIPv4Address(ip: string): string {
		if (ip.startsWith('::ffff:')) {
			return ip.replace('::ffff:', '');
		}
		return ip;
	}
}
