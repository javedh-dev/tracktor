import 'unplugin-icons/types/';
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
		}
		interface Locals {
			requestBody?: any;
			user?: {
				id: string;
				username: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Environment variable types for better type safety
declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'dev' | 'production' | 'test';
		SERVER_HOST: string;
		SERVER_PORT: string;
		DB_PATH: string;
		UPLOADS_DIR: string;
		AUTH_PIN: string;
		CORS_ORIGINS: string;
		FORCE_DATA_SEED: string;
		TRACKTOR_DEMO_MODE: string;
		LOG_REQUESTS: string;
		LOG_LEVEL: string;
		LOG_DIR: string;
		APP_VERSION?: string;
		TRACKTOR_DISABLE_AUTH: string;
		TRACKTOR_API_BASE_URL?: string;
	}
}

export { };
