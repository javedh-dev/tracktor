import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load environment variables at build time
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
			$server: './src/server'
		}
	}
};

export default config;
