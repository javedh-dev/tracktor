import { logger } from '$server/config';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { env } from '$lib/config/env.server';

function getClientAddress(event: RequestEvent): string {
  const forwardedFor = event.request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : event.getClientAddress();

  return ip.startsWith('::ffff:') ? ip.slice('::ffff:'.length) : ip;
}

export const handleLogging: Handle = ({ event, resolve }) => {
  if (env.LOG_REQUESTS) {
    logger.info(`${getClientAddress(event)} - ${event.request.method} - ${event.url.pathname}`);
  }

  return resolve(event);
};
