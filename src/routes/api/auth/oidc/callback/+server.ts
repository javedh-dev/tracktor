import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$lib/config/env.server';
import { handleCallback } from '$server/services/oidcService';

export const GET: RequestHandler = async (event) => {
  if (!env.OIDC_ENABLED) {
    throw redirect(307, '/login');
  }

  const stored = event.cookies.get('oidc_state');
  if (!stored) {
    throw redirect(307, '/login');
  }

  let state: string;
  let nonce: string;
  let codeVerifier: string;

  try {
    const parsed = JSON.parse(stored);
    state = parsed.state;
    nonce = parsed.nonce;
    codeVerifier = parsed.codeVerifier;
  } catch {
    throw redirect(307, '/login');
  }

  event.cookies.delete('oidc_state', {
    path: '/'
  });

  const callbackUrl = event.request.url;

  try {
    const result = await handleCallback(callbackUrl, state, nonce, codeVerifier);

    event.cookies.set('session', result.sessionToken, {
      path: '/',
      httpOnly: true,
      secure: env.HTTP_MODE === 'https',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });

    throw redirect(302, '/dashboard');
  } catch (err) {
    console.error('OIDC callback error:', err);
    throw redirect(307, '/login');
  }
};
