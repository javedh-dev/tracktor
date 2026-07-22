import type { RequestEvent } from '@sveltejs/kit';
import { BaseMiddleware, type MiddlewareResult } from './base';
import { CorsMiddleware } from './cors';

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 1000;

export class RateLimitMiddleware extends BaseMiddleware {
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  protected async process(event: RequestEvent): Promise<MiddlewareResult> {
    let clientAddress: string;

    try {
      clientAddress = event.getClientAddress();
    } catch {
      clientAddress = 'unknown-client';
    }

    const isAllowed = this.checkRateLimit(clientAddress);

    if (!isAllowed) {
      return {
        response: CorsMiddleware.createErrorResponse(
          'Rate Limit Exceeded. Please try again later.',
          429,
          event.request
        ),
        continue: false
      };
    }

    return { continue: true };
  }

  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const key = ip;

    let entry = this.rateLimitStore.get(key);
    if (entry && now > entry.resetTime) {
      entry = undefined;
      this.rateLimitStore.delete(key);
    }
    if (!entry) {
      entry = {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      };
      this.rateLimitStore.set(key, entry);
      return true;
    }
    entry.count++;

    if (entry.count > RATE_LIMIT_MAX) {
      return false;
    }
    return true;
  }
}
