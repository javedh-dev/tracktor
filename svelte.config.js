import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load environment variables at build time
const envFile =
	process.env.NODE_ENV === 'production'
		? 'environment/prod.env'
		: process.env.NODE_ENV === 'test'
			? 'environment/test.env'
			: 'environment/dev.env';

dotenvConfig({
	path: resolve(process.cwd(), envFile),
	override: false
});

// Also try to load from a root .env file if it exists
dotenvConfig({
	path: resolve(process.cwd(), '.env'),
	override: false
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Configure the adapter with environment-specific settings
			out: 'build',
			precompress: process.env.NODE_ENV === 'production',
			envPrefix: ''
		}),
		env: {
			publicPrefix: 'TRACKTOR_',
			privatePrefix: ''
		},
		alias: {
			$lib: './src/lib',
			$appui: './src/lib/components/ui/app',
			$models: './src/lib/types',
			$stores: './src/lib/stores',
			$services: './src/lib/services',
			$helper: './src/lib/helper',
			$feature: './src/lib/components/features',
			$server: './src/server',
			'@config': './src/server/config',
			'@db': './src/server/db',
			'@exceptions': './src/server/exceptions',
			'@utils': './src/server/utils',
			'@tracktor/common': './src/lib'
		}
	}
};

export default config;
