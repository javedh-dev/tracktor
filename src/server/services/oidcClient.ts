import * as client from 'openid-client';
import { and, eq } from 'drizzle-orm';
import { env } from '$lib/config/env.server';
import { db } from '$server/db';
import { oidcIdentitiesTable, usersTable } from '$server/db/schema';
import { AppError, Status } from '$server/exceptions/AppError';

export const isOidcEnabled = () => !env.DISABLE_AUTH && !!env.OIDC_ENABLED;
export const isLocalAuthEnabled = () => env.DISABLE_AUTH || !env.OIDC_DISABLE_LOCAL_AUTH;

export function requireLocalAuth(): void {
  if (!isLocalAuthEnabled())
    throw new AppError('Local authentication is disabled', Status.FORBIDDEN);
}

export function validateOidcConfiguration(): void {
  if (env.DISABLE_AUTH) return;
  if (env.OIDC_DISABLE_LOCAL_AUTH && !env.OIDC_ENABLED)
    throw new Error('OIDC_DISABLE_LOCAL_AUTH requires OIDC_ENABLED=true');
  if (!env.OIDC_ENABLED) return;
  if (
    !env.OIDC_ISSUER ||
    !env.OIDC_CLIENT_ID ||
    !env.OIDC_CLIENT_SECRET ||
    !env.OIDC_REDIRECT_URI
  ) {
    throw new Error('OIDC requires issuer, client ID, client secret, and redirect URI');
  }
  const issuer = new URL(env.OIDC_ISSUER);
  const redirect = new URL(env.OIDC_REDIRECT_URI);
  const loopback = (url: URL) => ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (
    issuer.protocol !== 'https:' &&
    !(env.NODE_ENV === 'test' && issuer.protocol === 'http:' && loopback(issuer))
  ) {
    throw new Error(
      'OIDC issuer must use HTTPS (insecure loopback is allowed only in NODE_ENV=test)'
    );
  }
  if (issuer.username || issuer.password || issuer.search || issuer.hash)
    throw new Error('Invalid OIDC issuer URL');
  if (
    !['http:', 'https:'].includes(redirect.protocol) ||
    redirect.username ||
    redirect.password ||
    redirect.search ||
    redirect.hash ||
    redirect.pathname !== `${env.BASE_URL}/api/auth/oidc/callback`
  )
    throw new Error('OIDC redirect URI must point to the configured application callback');
  if (redirect.protocol !== 'https:' && !loopback(redirect))
    throw new Error('OIDC redirect URI must use HTTPS except on loopback');
  if (redirect.protocol === 'https:' && env.HTTP_MODE !== 'https')
    throw new Error('Set HTTP_MODE=https for an HTTPS OIDC redirect URI');
  if (!env.OIDC_SCOPES.split(/\s+/).includes('openid'))
    throw new Error('OIDC_SCOPES must include openid');
}

let configuration: Promise<client.Configuration> | undefined;
export function getOidcClient(): Promise<client.Configuration> {
  validateOidcConfiguration();
  if (!isOidcEnabled()) throw new AppError('OIDC is disabled', Status.NOT_FOUND);
  configuration ??= client
    .discovery(new URL(env.OIDC_ISSUER), env.OIDC_CLIENT_ID, env.OIDC_CLIENT_SECRET, undefined, {
      execute: [
        client.enableNonRepudiationChecks,
        ...(env.NODE_ENV === 'test' && new URL(env.OIDC_ISSUER).protocol === 'http:'
          ? [client.allowInsecureRequests]
          : [])
      ]
    })
    .catch((error) => {
      configuration = undefined;
      throw error;
    });
  return configuration;
}

/** Checked inside the same transaction as account role/status changes. */
export async function assertOidcAdminAvailable(
  connection: Pick<typeof db, 'select'> = db
): Promise<void> {
  if (!isOidcEnabled() || !env.OIDC_DISABLE_LOCAL_AUTH) return;
  const issuer = (await getOidcClient()).serverMetadata().issuer;
  const users = await connection
    .select({ id: usersTable.id })
    .from(usersTable)
    .innerJoin(oidcIdentitiesTable, eq(oidcIdentitiesTable.userId, usersTable.id))
    .where(
      and(
        eq(usersTable.role, 'admin'),
        eq(usersTable.isActive, true),
        eq(oidcIdentitiesTable.issuer, issuer)
      )
    )
    .limit(1);
  if (!users.length)
    throw new AppError(
      'OIDC-only mode requires an active administrator linked to this issuer. Enable local login, link an administrator, then disable local login.',
      Status.CONFLICT
    );
}

export async function validateOidcStartup(): Promise<void> {
  validateOidcConfiguration();
  await assertOidcAdminAvailable();
}
