import { redirect, type RequestEvent } from '@sveltejs/kit';
import { env } from '$lib/config/env.server';
import { startOidc, finishOidc, OIDC_TRANSACTION_COOKIE } from '$server/services/oidcService';
import { requestAccess } from '$server/services/access';
import { isOidcEnabled } from '$server/services/oidcClient';
import { AppError, Status } from '$server/exceptions/AppError';
import { logger } from '$server/config';

const cookiePath = () => env.BASE_URL || '/';

export async function beginOidcRequest(event: RequestEvent, link: boolean): Promise<never> {
  if (!isOidcEnabled()) throw new AppError('OIDC is disabled', Status.NOT_FOUND);
  if (link) requestAccess(event);
  if (link && !event.cookies.get('session'))
    throw new AppError('An authenticated browser session is required', Status.UNAUTHORIZED);
  const result = await startOidc(link ? event.cookies.get('session') : undefined);
  event.cookies.set(OIDC_TRANSACTION_COOKIE, result.cookie, {
    path: cookiePath(),
    httpOnly: true,
    secure: env.HTTP_MODE === 'https',
    sameSite: 'lax',
    maxAge: 600
  });
  throw redirect(link ? 303 : 302, result.url);
}

export async function finishOidcRequest(event: RequestEvent): Promise<never> {
  const cookie = event.cookies.get(OIDC_TRANSACTION_COOKIE);
  event.cookies.delete(OIDC_TRANSACTION_COOKIE, { path: cookiePath() });
  let destination = `${env.BASE_URL}/${event.locals?.user ? 'dashboard' : 'login'}?oidc=error`;
  try {
    if (!isOidcEnabled()) throw new Error('OIDC is disabled');
    const target = new URL(env.OIDC_REDIRECT_URI);
    if (event.url.origin !== target.origin || event.url.pathname !== target.pathname)
      throw new Error('Invalid callback URL');
    const result = await finishOidc(event.url.href, cookie, event.cookies.get('session'));
    if (result.mode === 'login') {
      event.cookies.set('session', result.sessionToken, {
        path: '/',
        httpOnly: true,
        secure: env.HTTP_MODE === 'https',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      });
      destination = `${env.BASE_URL}/dashboard`;
    } else destination = `${env.BASE_URL}/dashboard?oidc=linked`;
  } catch (error) {
    // SDK/provider errors can contain credentials or tokens; do not log them.
    const code =
      error instanceof AppError
        ? String(error.status)
        : error &&
            typeof error === 'object' &&
            'code' in error &&
            typeof error.code === 'string' &&
            /^[A-Z_]+$/.test(error.code)
          ? error.code
          : 'UNKNOWN';
    logger.warn('OIDC sign-in or account linking failed', { code });
  }
  throw redirect(302, destination);
}
