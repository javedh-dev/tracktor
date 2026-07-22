import { serverEnv } from '$lib/config/env.server';
import type { RequestEvent } from '@sveltejs/kit';
import { BaseMiddleware, type MiddlewareResult } from './base';
import type { ApiResponse } from '$lib';

function corsHeaders(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': CorsMiddleware.getCorsOrigin(request),
    'Access-Control-Allow-Credentials': 'true'
  };
}

export class CorsMiddleware extends BaseMiddleware {
  protected async process(event: RequestEvent): Promise<MiddlewareResult> {
    if (event.request.method === 'OPTIONS') {
      return {
        response: this.handleCorsOptions(event.request),
        continue: false
      };
    }

    return { continue: true };
  }

  public static getCorsOrigin(request: Request): string {
    const requestOrigin = request.headers.get('origin');

    if (!requestOrigin) {
      return '*';
    }

    if (serverEnv?.CORS_ORIGINS.includes('*')) {
      return '*';
    }

    if (serverEnv?.CORS_ORIGINS.includes(requestOrigin)) {
      return requestOrigin;
    }

    return serverEnv?.CORS_ORIGINS[0] || '*';
  }

  public static createErrorResponse(
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
        ...corsHeaders(request)
      }
    });
  }

  public static addCorsHeaders(response: Response, request: Request): void {
    response.headers.set('Access-Control-Allow-Origin', CorsMiddleware.getCorsOrigin(request));
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  private handleCorsOptions(request: Request): Response {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': CorsMiddleware.getCorsOrigin(request),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-PIN',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
}
