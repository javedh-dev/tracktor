import { serverEnv } from '$lib/config/env.server';
import type { Handle } from '@sveltejs/kit';
import type { ApiResponse } from '$lib/response';

export function getCorsOrigin(request: Request): string {
  const requestOrigin = request.headers.get('origin');

  if (!requestOrigin || serverEnv?.CORS_ORIGINS.includes('*')) {
    return '*';
  }

  if (serverEnv?.CORS_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  return serverEnv?.CORS_ORIGINS[0] || '*';
}

export function errorResponse(
  message: string,
  status: number,
  request: Request,
  error?: Error
): Response {
  const body: ApiResponse = { success: false, message, errors: error ? [error] : [] };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': getCorsOrigin(request),
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}

export const handleCors: Handle = async ({ event, resolve }) => {
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': getCorsOrigin(event.request),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-PIN',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  const response = await resolve(event);
  response.headers.set('Access-Control-Allow-Origin', getCorsOrigin(event.request));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
};
