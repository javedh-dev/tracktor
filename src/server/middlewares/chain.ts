import { BaseMiddleware, type MiddlewareContext } from './base';
import { CorsMiddleware } from './corsMiddleware';
import { RateLimitMiddleware } from './rateLimitMiddleware';
import { LoggingMiddleware } from './loggingMiddleware';
import { AuthMiddleware } from './authMiddleware';

export class MiddlewareChain {
    private chain?: BaseMiddleware;

    constructor() {
        this.buildChain();
    }

    private buildChain(): void {
        // Build the middleware chain in order
        const corsMiddleware = new CorsMiddleware();
        const rateLimitMiddleware = new RateLimitMiddleware();
        const loggingMiddleware = new LoggingMiddleware();
        const authMiddleware = new AuthMiddleware();

        // Chain them together
        corsMiddleware
            .setNext(rateLimitMiddleware)
            .setNext(loggingMiddleware)
            .setNext(authMiddleware);

        this.chain = corsMiddleware;
    }

    async execute(context: MiddlewareContext): Promise<Response | null> {
        if (!this.chain) {
            return null;
        }

        const result = await this.chain.handle(context);
        return result.response || null;
    }

    // Allow dynamic chain modification
    setChain(chain: BaseMiddleware): void {
        this.chain = chain;
    }

    // Helper method to create custom chains
    static createCustomChain(...middlewares: BaseMiddleware[]): MiddlewareChain {
        const chain = new MiddlewareChain();

        if (middlewares.length > 0) {
            let current = middlewares[0];
            for (let i = 1; i < middlewares.length; i++) {
                current = current.setNext(middlewares[i]);
            }
            chain.setChain(middlewares[0]);
        }

        return chain;
    }
}