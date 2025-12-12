import type { RequestEvent } from '@sveltejs/kit';

export interface MiddlewareResult {
    response?: Response;
    continue: boolean;
}

export abstract class BaseMiddleware {
    protected next?: BaseMiddleware;

    setNext(middleware: BaseMiddleware): BaseMiddleware {
        this.next = middleware;
        return middleware;
    }

    async handle(event: RequestEvent): Promise<MiddlewareResult> {
        const result = await this.process(event);

        if (!result.continue || result.response) {
            return result;
        }

        if (this.next) {
            return await this.next.handle(event);
        }

        return { continue: true };
    }

    protected abstract process(event: RequestEvent): Promise<MiddlewareResult>;
}

export class MiddlewareChain {
    private firstMiddleware?: BaseMiddleware;

    public init(middlewares: BaseMiddleware[]) {
        middlewares.forEach((middleware, index) => {
            if (index > 0) {
                this.firstMiddleware!.setNext(middleware);
            } else {
                this.firstMiddleware = middleware;
            }
        });
    }

    async handle(event: RequestEvent): Promise<MiddlewareResult> {
        if (!this.firstMiddleware) {
            return { response: undefined, continue: false };
        }
        return await this.firstMiddleware!.handle(event);
    }
}


export { CorsMiddleware } from './cors';
export { RateLimitMiddleware } from './rateLimit';
export { LoggingMiddleware } from './logging';
export { AuthMiddleware } from './auth';