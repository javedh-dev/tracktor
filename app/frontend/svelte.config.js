import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			$lib: './src/lib',
			$appui: './src/lib/components/custom',
			$models: './src/models',
			$stores: './src/stores',
			$services: './src/services',
			$utils: './src/utils'
		}
	}
};

export default config;
