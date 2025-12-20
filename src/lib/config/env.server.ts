import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Client-side environment configuration
 * Only includes public environment variables that are safe to expose to the browser
 */
export const clientEnv = {
	DEMO_MODE: publicEnv.TRACKTOR_DEMO_MODE === 'true',
	// Allow disabling auth via either the public or private env var so it works in container deployments
	DISABLE_AUTH:
		publicEnv.TRACKTOR_DISABLE_AUTH === 'true' || privateEnv.TRACKTOR_DISABLE_AUTH === 'true'
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
		case 'dev':
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
	NODE_ENV: privateEnv.NODE_ENV || 'dev',
	DB_PATH: privateEnv.DB_PATH || getDBPath(),
	UPLOADS_DIR: privateEnv.UPLOADS_DIR || './uploads',
	CORS_ORIGINS: getCorsOrigins(privateEnv.CORS_ORIGINS),
	FORCE_DATA_SEED: privateEnv.FORCE_DATA_SEED === 'true',
	LOG_REQUESTS: !privateEnv.LOG_REQUESTS || privateEnv.LOG_REQUESTS === 'true',
	LOG_LEVEL: privateEnv.LOG_LEVEL || 'info',
	LOG_DIR: privateEnv.LOG_DIR || './logs',
	HTTP_MODE: privateEnv.HTTP_MODE || 'http',
	APP_VERSION: privateEnv.APP_VERSION
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
export const isDevelopment = env.NODE_ENV === 'dev';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
