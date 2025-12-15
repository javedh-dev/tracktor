import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

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
		csrf: {
			trustedOrigins: ['*']
		},
		env: {
			publicPrefix: 'TRACKTOR_',
			privatePrefix: ''
		},
		alias: {
			$lib: './src/lib',
			$ui: './src/lib/components/ui',
			$appui: './src/lib/components/app',
			$layout: './src/lib/components/layout',
			$feature: './src/lib/components/feature',
			$stores: './src/lib/stores',
			$services: './src/lib/services',
			$helper: './src/lib/helper',
			$server: './src/server'
		}
	}
};

export default config;
