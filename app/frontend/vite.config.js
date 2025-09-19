import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import pkg from "./package.json"

export default defineConfig(({ mode }) => {
	// Load env file from root directory
	const env = loadEnv(mode, resolve(process.cwd(), '../../'), '');
	return {
		plugins: [tailwindcss(), sveltekit()],
		server: {
			port: Number(env.CLIENT_PORT) || 5173,
			host: env.CLIENT_HOST || '0.0.0.0',
			proxy: {
				'/api': `http://localhost:3000`
			}
		},
		envDir: resolve(process.cwd(), '../../'),
		optimizeDeps: {
			include: []
		},
		build: {
			commonjsOptions: {
				include: [
					'../../node_modules/style-to-object/**',
					'../../node_modules/memoize-weak/**',
					'../../node_modules/currency-codes/**',
					'../../node_modules/@dagrejs/**',
					'../../node_modules/property-expr/**',
					'../../node_modules/toposort/**',
					'../../node_modules/tiny-case/**',
					'../../node_modules/validator/**',
					'../../node_modules/dayjs/**'
				]
			}
		}
	};
});
