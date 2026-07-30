import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$lib/config/env.server';
import { generateState, generateNonce, getAuthorizationUrl, generateCodeVerifier } from '$server/services/oidcService';

export const GET: RequestHandler = async (event) => {
  if (!env.OIDC_ENABLED) {
    throw redirect(307, '/login');
  }

  const state = generateState();
  const nonce = generateNonce();
  const codeVerifier = generateCodeVerifier();

  event.cookies.set('oidc_state', JSON.stringify({ state, nonce, codeVerifier }), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: env.HTTP_MODE === 'https',
    maxAge: 60 * 10
  });

  const authUrl = await getAuthorizationUrl(state, nonce, codeVerifier);

  throw redirect(302, authUrl);
};
