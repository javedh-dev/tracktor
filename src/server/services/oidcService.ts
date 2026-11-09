// Adapted from Alejandro-SB's OIDC contribution: https://github.com/javedh-dev/tracktor/pull/232
import { createHash } from 'node:crypto';
import * as client from 'openid-client';
import { and, eq, gt, lte } from 'drizzle-orm';
import { z } from 'zod';
import { db, writeTransaction } from '$server/db';
import {
  oidcTransactionsTable,
  oidcIdentitiesTable,
  sessionsTable,
  usersTable
} from '$server/db/schema';
import { env } from '$lib/config/env.server';
import { usernameSchema } from '$lib/domain/auth';
import { AppError, Status } from '$server/exceptions/AppError';
import { createSession, generateSessionToken, validateSessionToken } from '$server/utils/session';
import { getOidcClient } from './oidcClient';

export const OIDC_TRANSACTION_COOKIE = 'oidc_transaction';
const TRANSACTION_LIFETIME_MS = 10 * 60 * 1000;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');

export async function startOidc(sessionToken?: string) {
  const config = await getOidcClient();
  const admin = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(eq(usersTable.role, 'admin'), eq(usersTable.isActive, true)))
    .limit(1);
  if (!admin.length)
    throw new AppError(
      'Create the first local administrator at /register before using SSO',
      Status.CONFLICT
    );
  const current = sessionToken ? await validateSessionToken(sessionToken) : null;
  if (sessionToken && !current?.user) throw new AppError('Not authenticated', Status.UNAUTHORIZED);
  const cookie = client.randomState();
  const state = client.randomState();
  const nonce = client.randomNonce();
  const codeVerifier = client.randomPKCECodeVerifier();
  const url = client.buildAuthorizationUrl(config, {
    redirect_uri: env.OIDC_REDIRECT_URI,
    scope: env.OIDC_SCOPES,
    code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
    state,
    nonce
  });
  await writeTransaction(async (tx) => {
    await tx.delete(oidcTransactionsTable).where(lte(oidcTransactionsTable.expiresAt, Date.now()));
    await tx.insert(oidcTransactionsTable).values({
      id: digest(cookie),
      state,
      nonce,
      codeVerifier,
      expiresAt: Date.now() + TRANSACTION_LIFETIME_MS,
      userId: current?.user?.id ?? null,
      sessionId: current?.session?.id ?? null
    });
  });
  return { cookie, url: url.href };
}

/** Consumes the browser-bound transaction before exchanging any authorization code. */
export async function finishOidc(
  callbackUrl: string,
  cookie: string | undefined,
  sessionToken?: string
) {
  if (!cookie) throw new AppError('OIDC login transaction is missing', Status.BAD_REQUEST);
  const [transaction] = await writeTransaction((tx) =>
    tx
      .delete(oidcTransactionsTable)
      .where(
        and(
          eq(oidcTransactionsTable.id, digest(cookie)),
          gt(oidcTransactionsTable.expiresAt, Date.now())
        )
      )
      .returning()
  );
  if (!transaction)
    throw new AppError('OIDC login transaction is expired or already used', Status.BAD_REQUEST);
  const current =
    transaction.userId && sessionToken ? await validateSessionToken(sessionToken) : null;
  if (
    transaction.userId &&
    (!current?.session ||
      current.user?.id !== transaction.userId ||
      current.session.id !== transaction.sessionId)
  ) {
    throw new AppError('The account-linking session is no longer valid', Status.UNAUTHORIZED);
  }
  const config = await getOidcClient();
  const tokens = await client.authorizationCodeGrant(config, new URL(callbackUrl), {
    pkceCodeVerifier: transaction.codeVerifier,
    expectedState: transaction.state,
    expectedNonce: transaction.nonce,
    idTokenExpected: true
  });
  const claims = tokens.claims();
  if (!claims) throw new AppError('OIDC ID token is required', Status.UNAUTHORIZED);
  const subject = z.string().min(1).max(255).parse(claims.sub);
  const issuer = config.serverMetadata().issuer;
  return writeTransaction(async (tx) => {
    const signIn = async (userId: string) => {
      const sessionToken = generateSessionToken();
      await createSession(sessionToken, userId, tx);
      return { mode: 'login' as const, sessionToken };
    };
    const [identity] = await tx
      .select()
      .from(oidcIdentitiesTable)
      .where(and(eq(oidcIdentitiesTable.issuer, issuer), eq(oidcIdentitiesTable.subject, subject)));
    if (transaction.userId) {
      const [session] = await tx
        .select({ id: sessionsTable.id })
        .from(sessionsTable)
        .where(
          and(
            eq(sessionsTable.id, transaction.sessionId!),
            eq(sessionsTable.userId, transaction.userId),
            gt(sessionsTable.expiresAt, Math.floor(Date.now() / 1000))
          )
        );
      if (!session)
        throw new AppError('The account-linking session is no longer valid', Status.UNAUTHORIZED);
      if (identity && identity.userId !== transaction.userId)
        throw new AppError('OIDC identity is already linked to another account', Status.CONFLICT);
      const [account] = await tx
        .select()
        .from(usersTable)
        .where(and(eq(usersTable.id, transaction.userId), eq(usersTable.isActive, true)));
      if (!account) throw new AppError('Account is disabled', Status.UNAUTHORIZED);
      if (!identity) {
        const existing = await tx
          .select()
          .from(oidcIdentitiesTable)
          .where(
            and(eq(oidcIdentitiesTable.userId, account.id), eq(oidcIdentitiesTable.issuer, issuer))
          );
        if (existing.length)
          throw new AppError('Account already has an identity for this issuer', Status.CONFLICT);
        await tx.insert(oidcIdentitiesTable).values({ issuer, subject, userId: account.id });
      }
      return { mode: 'link' as const };
    }
    if (identity) {
      const [account] = await tx
        .select()
        .from(usersTable)
        .where(and(eq(usersTable.id, identity.userId), eq(usersTable.isActive, true)));
      if (!account) throw new AppError('Account is disabled', Status.UNAUTHORIZED);
      return signIn(account.id);
    }
    const admin = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.role, 'admin'), eq(usersTable.isActive, true)))
      .limit(1);
    if (!admin.length)
      throw new AppError('Create the first local administrator before using SSO', Status.CONFLICT);
    const suggested = [claims.preferred_username, claims.email]
      .map((value) => usernameSchema.safeParse(value))
      .find((result) => result.success);
    const base = suggested?.success ? suggested.data : 'oidc_user';
    let username = base;
    while (
      (
        await tx
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.username, username))
      ).length
    ) {
      username = `${base.slice(0, 110)}_${crypto.randomUUID().slice(0, 8)}`;
    }
    const [account] = await tx
      .insert(usersTable)
      .values({
        id: crypto.randomUUID(),
        username,
        // Empty hashes represent external-only accounts, never a usable local credential.
        passwordHash: '',
        role: 'driver',
        isActive: true
      })
      .returning();
    await tx.insert(oidcIdentitiesTable).values({ issuer, subject, userId: account.id });
    return signIn(account.id);
  });
}
