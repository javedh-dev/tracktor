import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
	// Load env file from root directory
	const env = loadEnv(mode, resolve(process.cwd(), '../../'), '');

	return {
		plugins: [tailwindcss(), sveltekit()],
		server: {
			port: Number(env.CLIENT_PORT) || 5173,
			host: env.CLIENT_HOST || '0.0.0.0'
		},
		envDir: resolve(process.cwd(), '../../'),
		optimizeDeps: {
			include: ['svelte5-chartjs']
		},
		build: {
			commonjsOptions: {
				include: ['./node_modules/svelte-chartjs/**', './node_modules/chart.js/**']
			}
		}
	};
});
