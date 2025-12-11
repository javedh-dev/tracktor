import { browser } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Client-side environment configuration
 * Only includes public environment variables that are safe to expose to the browser
 */
export const clientEnv = {
	DEMO_MODE: publicEnv.TRACKTOR_DEMO_MODE === 'true',
	API_BASE_URL: publicEnv.TRACKTOR_API_BASE_URL || '',
	DISABLE_AUTH: publicEnv.TRACKTOR_DISABLE_AUTH === 'true'
} as const;

/**
 * Server-side environment configuration
 * Includes all environment variables, only available on the server
 */
export const serverEnv = browser
	? null
	: ({
			NODE_ENV: privateEnv.NODE_ENV || 'dev',
			SERVER_HOST: privateEnv.SERVER_HOST || '0.0.0.0',
			SERVER_PORT: parseInt(privateEnv.SERVER_PORT || '3000'),
			DB_PATH: privateEnv.DB_PATH || './tracktor.db',
			UPLOADS_DIR: privateEnv.UPLOADS_DIR || './uploads',
			AUTH_PIN: privateEnv.AUTH_PIN || '123456',
			CORS_ORIGINS: getCorsOrigins(privateEnv.CORS_ORIGINS),
			FORCE_DATA_SEED: privateEnv.FORCE_DATA_SEED === 'true',
			DEMO_MODE: privateEnv.TRACKTOR_DEMO_MODE === 'true',
			LOG_REQUESTS: privateEnv.LOG_REQUESTS === 'true',
			LOG_LEVEL: privateEnv.LOG_LEVEL || 'info',
			LOG_DIR: privateEnv.LOG_DIR || './logs',
			APP_VERSION: privateEnv.APP_VERSION,
			DISABLE_AUTH: privateEnv.TRACKTOR_DISABLE_AUTH === 'true'
		} as const);

/**
 * Universal environment configuration
 * Available on both client and server, but only includes public variables
 */
export const env = {
	...clientEnv,
	// Add server-side variables when on server
	...(serverEnv || {})
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

// Environment helpers
export const isDevelopment = env.NODE_ENV === 'dev';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
