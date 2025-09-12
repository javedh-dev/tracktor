import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			$lib: './src/lib',
			$appui: './src/lib/components/ui/app',
			$models: './src/lib/types',
			$stores: './src/lib/stores',
			$services: './src/lib/services',
			$utils: './src/lib/utility',
			$feature: './src/lib/components/features'
		}
	}
};

export default config;
