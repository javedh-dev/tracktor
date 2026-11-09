import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServer, type Server } from 'node:http';
import { generateKeyPairSync, createSign, createHash } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { migrate } from 'drizzle-orm/libsql/migrator';

const { testEnv } = vi.hoisted(() => ({
  testEnv: {
    DB_PATH: `/tmp/tracktor-oidc-${crypto.randomUUID()}.db`,
    DISABLE_AUTH: false,
    BASE_URL: '',
    HTTP_MODE: 'http',
    NODE_ENV: 'test',
    OIDC_ENABLED: true,
    OIDC_ISSUER: '',
    OIDC_CLIENT_ID: 'test-client',
    OIDC_CLIENT_SECRET: 'test-secret',
    OIDC_REDIRECT_URI: 'http://localhost:5189/api/auth/oidc/callback',
    OIDC_SCOPES: 'openid profile email',
    OIDC_DISABLE_LOCAL_AUTH: false
  }
}));
vi.mock('$lib/config/env.server', () => ({
  env: testEnv,
  serverEnv: { CORS_ORIGINS: ['*'], UPLOADS_DIR: '/tmp' }
}));
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { startOidc, finishOidc } from '$server/services/oidcService';
import { assertOidcAdminAvailable, validateOidcConfiguration } from '$server/services/oidcClient';
import { createUser, loginUser, updateUserProfile } from '$server/services/authService';
import { updateManagedUser, resetLocalPassword } from '$server/services/userService';
import { getAllVehicles } from '$server/services/vehicleService';
import { validateSessionToken } from '$server/utils/session';
import { load as appLayout } from '../../routes/(app)/+layout.server';
import { finishOidcRequest } from '$server/utils/oidc-routes';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', use: 'sig', alg: 'RS256' };
let server: Server;
const codes = new Map<
  string,
  { nonce: string; challenge: string; claims: Record<string, unknown>; omitIdToken?: boolean }
>();
const admin = { id: 'admin', username: 'local-admin', role: 'admin' as const, isActive: true };

beforeAll(async () => {
  server = createServer(async (request, response) => {
    const url = new URL(request.url!, testEnv.OIDC_ISSUER);
    response.setHeader('content-type', 'application/json');
    if (url.pathname.endsWith('/.well-known/openid-configuration')) {
      response.end(
        JSON.stringify({
          issuer: testEnv.OIDC_ISSUER,
          authorization_endpoint: `${testEnv.OIDC_ISSUER}/authorize`,
          token_endpoint: `${testEnv.OIDC_ISSUER}/token`,
          jwks_uri: `${testEnv.OIDC_ISSUER}/jwks`,
          response_types_supported: ['code'],
          subject_types_supported: ['public'],
          id_token_signing_alg_values_supported: ['RS256'],
          token_endpoint_auth_methods_supported: ['client_secret_post'],
          code_challenge_methods_supported: ['S256']
        })
      );
    } else if (url.pathname === '/jwks') response.end(JSON.stringify({ keys: [jwk] }));
    else if (url.pathname === '/token') {
      let body = '';
      for await (const part of request) body += part;
      const params = new URLSearchParams(body);
      const code = codes.get(params.get('code')!);
      codes.delete(params.get('code')!);
      const challenge = createHash('sha256')
        .update(params.get('code_verifier') || '')
        .digest('base64url');
      if (
        !code ||
        code.challenge !== challenge ||
        params.get('client_id') !== testEnv.OIDC_CLIENT_ID ||
        params.get('client_secret') !== testEnv.OIDC_CLIENT_SECRET
      ) {
        response.statusCode = 400;
        response.end(JSON.stringify({ error: 'invalid_grant' }));
        return;
      }
      const claims = {
        iss: testEnv.OIDC_ISSUER,
        sub: 'external-user',
        aud: testEnv.OIDC_CLIENT_ID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 600,
        nonce: code.nonce,
        preferred_username: 'external-user',
        ...code.claims
      };
      const data = `${Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-key' })).toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}`;
      const signature = createSign('RSA-SHA256')
        .update(data)
        .sign(privateKey)
        .toString('base64url');
      response.end(
        JSON.stringify({
          access_token: 'access',
          token_type: 'Bearer',
          expires_in: 600,
          ...(code.omitIdToken
            ? {}
            : {
                id_token: `${data}.${code.claims.badSignature ? (signature.startsWith('A') ? 'B' : 'A') + signature.slice(1) : signature}`
              })
        })
      );
    } else {
      response.statusCode = 404;
      response.end('{}');
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test issuer');
  testEnv.OIDC_ISSUER = `http://127.0.0.1:${address.port}`;
  await migrate(db, {
    migrationsFolder: 'src/server/db/migrations',
    migrationsTable: '_migrations'
  });
});

beforeEach(async () => {
  testEnv.OIDC_ENABLED = true;
  testEnv.DISABLE_AUTH = false;
  testEnv.OIDC_DISABLE_LOCAL_AUTH = false;
  testEnv.BASE_URL = '';
  testEnv.OIDC_SCOPES = 'openid profile email';
  await db.delete(schema.oidcTransactionsTable);
  await db.delete(schema.oidcIdentitiesTable);
  await db.delete(schema.sessionsTable);
  await db.delete(schema.vehicleAssignmentsTable);
  await db.delete(schema.usersTable);
  await db.insert(schema.usersTable).values({ ...admin, passwordHash: 'not-a-password-hash' });
  codes.clear();
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  db.$client.close();
  for (const suffix of ['', '-shm', '-wal'])
    await rm(`${testEnv.DB_PATH}${suffix}`, { force: true });
});

async function authorization(
  claims: Record<string, unknown> = {},
  sessionToken?: string,
  omitIdToken = false
) {
  const transaction = await startOidc(sessionToken);
  const url = new URL(transaction.url);
  const code = crypto.randomUUID();
  codes.set(code, {
    nonce: url.searchParams.get('nonce')!,
    challenge: url.searchParams.get('code_challenge')!,
    claims,
    omitIdToken
  });
  const callback = new URL(testEnv.OIDC_REDIRECT_URI);
  callback.searchParams.set('code', code);
  callback.searchParams.set('state', url.searchParams.get('state')!);
  return { ...transaction, callback };
}

async function signIn(claims: Record<string, unknown> = {}) {
  const transaction = await authorization(claims);
  const result = await finishOidc(transaction.callback.href, transaction.cookie);
  if (result.mode !== 'login') throw new Error('Expected login');
  return {
    ...transaction,
    token: result.sessionToken,
    user: (await validateSessionToken(result.sessionToken)).user!
  };
}

describe('OIDC using real discovery, signatures, and PKCE token exchange', () => {
  it('provisions a Driver with no vehicle access and reuses that identity', async () => {
    const first = await signIn();
    expect(first.user).toMatchObject({
      username: 'external-user',
      role: 'driver',
      hasLocalPassword: false
    });
    expect(await getAllVehicles(first.user)).toEqual([]);
    expect((await signIn()).user.id).toBe(first.user.id);
    expect(await db.select().from(schema.oidcIdentitiesTable)).toHaveLength(1);
  });

  it('never auto-links an existing username or email and handles absent claims', async () => {
    const first = await signIn({ preferred_username: 'local-admin', email: 'local-admin' });
    expect(first.user.id).not.toBe(admin.id);
    expect(first.user.username).not.toBe(admin.username);
    expect(first.user.role).toBe('driver');
    expect(
      (await signIn({ sub: 'missing-claims', preferred_username: null, email: 123 })).user.username
    ).toBe('oidc_user');
  });

  it('keys subject lookup by the validated issuer', async () => {
    await db
      .insert(schema.oidcIdentitiesTable)
      .values({ issuer: 'https://other.example', subject: 'external-user', userId: admin.id });
    expect((await signIn()).user.id).not.toBe(admin.id);
  });

  it('consumes transactions once and rejects replay, expiry, and missing cookies', async () => {
    const transaction = await authorization();
    await finishOidc(transaction.callback.href, transaction.cookie);
    await expect(finishOidc(transaction.callback.href, transaction.cookie)).rejects.toMatchObject({
      status: 400
    });
    await expect(finishOidc(transaction.callback.href, undefined)).rejects.toMatchObject({
      status: 400
    });
    const expired = await authorization({ sub: 'expired' });
    await db.update(schema.oidcTransactionsTable).set({ expiresAt: Date.now() - 1 });
    await expect(finishOidc(expired.callback.href, expired.cookie)).rejects.toMatchObject({
      status: 400
    });
  });

  it.each([
    'signature',
    'state',
    'nonce',
    'pkce',
    'issuer',
    'audience',
    'expired-token',
    'no-id-token',
    'provider-error'
  ])('rejects %s without provisioning or session creation', async (failure) => {
    const claims =
      failure === 'signature'
        ? { badSignature: true }
        : failure === 'nonce'
          ? { nonce: 'wrong' }
          : failure === 'issuer'
            ? { iss: 'https://evil.example' }
            : failure === 'audience'
              ? { aud: 'wrong-client' }
              : failure === 'expired-token'
                ? { exp: 1 }
                : {};
    const transaction = await authorization(claims, undefined, failure === 'no-id-token');
    if (failure === 'state') transaction.callback.searchParams.set('state', 'wrong');
    if (failure === 'pkce')
      await db.update(schema.oidcTransactionsTable).set({ codeVerifier: 'wrong-verifier' });
    if (failure === 'provider-error') {
      transaction.callback.searchParams.delete('code');
      transaction.callback.searchParams.set('error', 'access_denied');
    }
    await expect(finishOidc(transaction.callback.href, transaction.cookie)).rejects.toBeDefined();
    expect(await db.select().from(schema.usersTable)).toHaveLength(1);
    expect(await db.select().from(schema.sessionsTable)).toHaveLength(0);
  });

  it('links only to the initiating session and rejects identities owned by someone else', async () => {
    await resetLocalPassword(admin, admin.id, 'local-password');
    const login = await loginUser(admin.username, 'local-password');
    const transaction = await authorization({ sub: 'admin-subject' }, login.sessionToken);
    expect(
      await finishOidc(transaction.callback.href, transaction.cookie, login.sessionToken)
    ).toEqual({ mode: 'link' });
    expect((await signIn({ sub: 'admin-subject' })).user.id).toBe(admin.id);
    const owned = await signIn({ sub: 'someone-else' });
    const conflict = await authorization({ sub: 'someone-else' }, login.sessionToken);
    await expect(
      finishOidc(conflict.callback.href, conflict.cookie, login.sessionToken)
    ).rejects.toMatchObject({ status: 409 });
    expect(owned.user.id).not.toBe(admin.id);
    const missingSession = await authorization({ sub: 'another' }, login.sessionToken);
    await expect(
      finishOidc(missingSession.callback.href, missingSession.cookie)
    ).rejects.toMatchObject({ status: 401 });
  });

  it('refuses disabled accounts without creating a replacement identity/session', async () => {
    const login = await signIn();
    await updateManagedUser(admin, login.user.id, { isActive: false });
    const transaction = await authorization();
    await expect(finishOidc(transaction.callback.href, transaction.cookie)).rejects.toMatchObject({
      status: 401
    });
    expect(await db.select().from(schema.sessionsTable)).toHaveLength(0);
    expect(await db.select().from(schema.usersTable)).toHaveLength(2);
  });

  it('protects OIDC-only startup and the final linked active administrator', async () => {
    testEnv.OIDC_DISABLE_LOCAL_AUTH = true;
    await expect(assertOidcAdminAvailable()).rejects.toMatchObject({ status: 409 });
    await db
      .insert(schema.oidcIdentitiesTable)
      .values({ issuer: testEnv.OIDC_ISSUER, subject: 'admin', userId: admin.id });
    await expect(assertOidcAdminAvailable()).resolves.toBeUndefined();
    await db.insert(schema.usersTable).values({
      id: 'local-only',
      username: 'local-only',
      role: 'admin',
      passwordHash: 'not-used'
    });
    await expect(updateManagedUser(admin, admin.id, { role: 'driver' })).rejects.toMatchObject({
      status: 409
    });
    await expect(loginUser(admin.username, 'anything')).rejects.toMatchObject({ status: 403 });
    await expect(createUser('newlocal', 'password')).rejects.toMatchObject({ status: 403 });
    await expect(resetLocalPassword(admin, admin.id, 'new-password')).rejects.toMatchObject({
      status: 403
    });
    await expect(
      updateUserProfile(admin.id, { newPassword: 'new-password', currentPassword: 'old-password' })
    ).rejects.toMatchObject({ status: 403 });
  });

  it('redirects successful callbacks outside catch blocks and clears the transaction cookie', async () => {
    const transaction = await authorization();
    const cookies = {
      get: (name: string) => (name === 'oidc_transaction' ? transaction.cookie : undefined),
      delete: vi.fn(),
      set: vi.fn()
    };
    await expect(
      finishOidcRequest({ url: transaction.callback, cookies } as never)
    ).rejects.toMatchObject({ status: 302, location: '/dashboard' });
    expect(cookies.delete).toHaveBeenCalledWith('oidc_transaction', { path: '/' });
    expect(cookies.set).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
    );
  });

  it('validates configuration, supports a base path, and ignores OIDC when auth is disabled', () => {
    testEnv.BASE_URL = '/tracktor';
    expect(() => validateOidcConfiguration()).toThrow('callback');
    testEnv.OIDC_REDIRECT_URI = 'http://localhost:5189/tracktor/api/auth/oidc/callback';
    expect(() => validateOidcConfiguration()).not.toThrow();
    testEnv.OIDC_SCOPES = 'email';
    expect(() => validateOidcConfiguration()).toThrow('openid');
    testEnv.DISABLE_AUTH = true;
    expect(() => validateOidcConfiguration()).not.toThrow();
    testEnv.OIDC_REDIRECT_URI = 'http://localhost:5189/api/auth/oidc/callback';
  });
});

it('requires local admin bootstrap before first SSO provisioning', async () => {
  await db.delete(schema.usersTable);
  await expect(startOidc()).rejects.toMatchObject({ status: 409 });
  expect(await db.select().from(schema.usersTable)).toHaveLength(0);
  await expect(createUser('first-admin', 'local-password')).resolves.toBeDefined();
  expect((await db.query.usersTable.findFirst())?.role).toBe('admin');
});

it('returns auth capabilities for direct authenticated app loads', async () => {
  testEnv.OIDC_DISABLE_LOCAL_AUTH = true;
  const data = await appLayout({ locals: { user: admin } } as never);
  expect(data).toMatchObject({
    authCapabilities: { oidcEnabled: true, localAuthEnabled: false, isAuthDisabled: false }
  });
});
