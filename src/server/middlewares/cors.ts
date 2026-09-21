import { serverEnv } from '$lib/config/env.server';
import type { Handle } from '@sveltejs/kit';
import type { ApiResponse } from '$lib/response';

/**
 * Resolves the Origin to echo back, or `null` when the request's Origin is present but
 * not on the configured allow-list — callers must then omit the CORS headers entirely
 * rather than fall back to some other configured origin (that would let an origin the
 * operator never allowed borrow another allowed origin's CORS grant).
 */
export function getCorsOrigin(request: Request): string | null {
  const requestOrigin = request.headers.get('origin');

  if (!requestOrigin || serverEnv?.CORS_ORIGINS.includes('*')) {
    return '*';
  }

  if (serverEnv?.CORS_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  return null;
}

function applyCorsHeaders(headers: Headers, request: Request): void {
  const origin = getCorsOrigin(request);
  if (!origin) return;

  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
}

export function errorResponse(
  message: string,
  status: number,
  request: Request,
  error?: Error
): Response {
  const body: ApiResponse = { success: false, message, errors: error ? [error] : [] };
  const headers = new Headers({ 'Content-Type': 'application/json' });
  applyCorsHeaders(headers, request);

  return new Response(JSON.stringify(body), { status, headers });
}

export const handleCors: Handle = async ({ event, resolve }) => {
  if (event.request.method === 'OPTIONS') {
    const headers = new Headers({
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    applyCorsHeaders(headers, event.request);

    return new Response(null, { status: 200, headers });
  }

  const response = await resolve(event);
  applyCorsHeaders(response.headers, event.request);
  return response;
};
