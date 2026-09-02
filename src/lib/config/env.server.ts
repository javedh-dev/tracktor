import { env as privateEnv } from '$env/dynamic/private';
import { clientEnv as publicClientEnv } from './env';

/**
 * Client-side environment configuration, plus the server-only way of disabling auth
 * (the private env var also works, so it can be set in container deployments).
 */
export const clientEnv = {
  ...publicClientEnv,
  DISABLE_AUTH: publicClientEnv.DISABLE_AUTH || privateEnv.TRACKTOR_DISABLE_AUTH === 'true'
} as const;

function getCorsOrigins(origins?: string): string[] {
  if (!origins) {
    return ['*'];
  }

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getDBPath(): string | undefined {
  switch (privateEnv.NODE_ENV) {
    case 'development':
      return './tracktor.dev.db';
    case 'test':
      return './tracktor.test.db';
    case 'production':
    default:
      return './tracktor.db';
  }
}

/**
 * Server-side environment configuration
 * Includes all environment variables
 */
export const serverEnv = {
  NODE_ENV: privateEnv.NODE_ENV || 'development',
  DB_PATH: privateEnv.DB_PATH || getDBPath(),
  UPLOADS_DIR: privateEnv.UPLOADS_DIR || './uploads',
  CORS_ORIGINS: getCorsOrigins(privateEnv.CORS_ORIGINS),
  FORCE_DATA_SEED: privateEnv.FORCE_DATA_SEED === 'true',
  LOG_REQUESTS: !privateEnv.LOG_REQUESTS || privateEnv.LOG_REQUESTS === 'true',
  LOG_LEVEL: privateEnv.LOG_LEVEL || 'info',
  LOG_DIR: privateEnv.LOG_DIR || './logs',
  HTTP_MODE: privateEnv.HTTP_MODE || 'http',
  APP_VERSION: privateEnv.APP_VERSION,
  BASE_URL: privateEnv.BASE_URL || '',
  APP_SECRET: privateEnv.APP_SECRET || '',

  OIDC_ENABLED: privateEnv.OIDC_ENABLED === 'true',
  OIDC_ISSUER: privateEnv.OIDC_ISSUER || '',
  OIDC_CLIENT_ID: privateEnv.OIDC_CLIENT_ID || '',
  OIDC_CLIENT_SECRET: privateEnv.OIDC_CLIENT_SECRET || '',
  OIDC_REDIRECT_URI: privateEnv.OIDC_REDIRECT_URI || '',
  OIDC_SCOPES: privateEnv.OIDC_SCOPES || 'openid profile email'
} as const;

/**
 * Universal environment configuration
 * Available on server
 */
export const env = {
  ...clientEnv,
  ...serverEnv
} as const;

// Environment helpers
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
