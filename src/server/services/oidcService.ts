import * as client from 'openid-client';
import type { Configuration } from 'openid-client';
import { env } from '$lib/config/env.server';
import * as authService from './authService';
import { generateSessionToken, createSession } from '../utils/session';

let configPromise: Promise<Configuration> | null = null;
let cachedIssuerUrl: string | null = null;

const getConfig = async () => {
  if (configPromise && cachedIssuerUrl === env.OIDC_ISSUER) {
    return configPromise;
  }

  const server = new URL(env.OIDC_ISSUER);

  configPromise = client
    .discovery(server, env.OIDC_CLIENT_ID, {
      client_secret: env.OIDC_CLIENT_SECRET
    })
    .catch((err) => {
      configPromise = null;
      throw err;
    });

  cachedIssuerUrl = env.OIDC_ISSUER;

  return configPromise;
};

export const generateState = () => client.randomState();
export const generateNonce = () => client.randomNonce();
export const generateCodeVerifier = () => client.randomPKCECodeVerifier();

export const getAuthorizationUrl = async (state: string, nonce: string, codeVerifier: string) => {
  const config = await getConfig();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const redirectUri = env.OIDC_REDIRECT_URI;

  return client
    .buildAuthorizationUrl(config, {
      scope: env.OIDC_SCOPES,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce
    })
    .toString();
};

export const handleCallback = async (
  callbackUrl: string,
  state: string,
  nonce: string,
  codeVerifier: string
) => {
  const config = await getConfig();

  const tokens = await client.authorizationCodeGrant(config, new URL(callbackUrl), {
    pkceCodeVerifier: codeVerifier,
    expectedState: state,
    expectedNonce: nonce
  });

  const claims = tokens.claims();

  if (!claims) {
    throw new Error('OIDC: No ID token claims returned');
  }

  const oidcId = claims.sub;
  const oidcProvider = env.OIDC_ISSUER;

  const existingUser = await authService.findUserByOidcId(oidcId);

  if (existingUser) {
    const sessionToken = generateSessionToken();
    await createSession(sessionToken, existingUser.id);
    return { sessionToken, user: { id: existingUser.id, username: existingUser.username } };
  }

  const username =
    (await authService.getFirstAvailableUsername(
      claims.preferred_username as string,
      claims.email as string
    )) ?? `oidc_${oidcId.slice(0, 8)}`;

  const newUser = await authService.createUserFromOidc(username, oidcId, oidcProvider);
  const sessionToken = generateSessionToken();
  await createSession(sessionToken, newUser.id);

  return { sessionToken, user: { id: newUser.id, username: newUser.username } };
};
