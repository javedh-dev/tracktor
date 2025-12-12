import type { RequestEvent } from '@sveltejs/kit';

export interface MiddlewareContext {
    event: RequestEvent;
    clientIP: string;
}

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

    async handle(context: MiddlewareContext): Promise<MiddlewareResult> {
        const result = await this.process(context);

        if (!result.continue || result.response) {
            return result;
        }

        if (this.next) {
            return await this.next.handle(context);
        }

        return { continue: true };
    }

    protected abstract process(context: MiddlewareContext): Promise<MiddlewareResult>;
}