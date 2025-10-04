import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
	// Load env file from root directory
	console.log('Running in mode : ', mode);
	const env = loadEnv(mode, resolve(process.cwd(), '../../'), '');

	// Determine API URL for proxy based on environment
	const getApiUrl = () => {
		switch (mode) {
			case 'test':
				return 'http://localhost:3001';
			case 'production':
				return env.VITE_API_URL || 'https://api.yourdomain.com';
			default:
				return 'http://localhost:3000';
		}
	};

	return {
		plugins: [tailwindcss(), sveltekit()],
		server: {
			port: Number(env.CLIENT_PORT) || 5173,
			host: env.CLIENT_HOST || '0.0.0.0',
			proxy: {
				'/api': getApiUrl()
			}
		},
		envDir: resolve(process.cwd(), '../../'),
		optimizeDeps: {
			include: ['currency-codes', 'dayjs', 'validator']
		},
		...(mode === 'production' && {
			ssr: {
				noExternal: [
					'style-to-object',
					'memoize-weak',
					'currency-codes',
					'@dagrejs/dagre',
					'property-expr',
					'toposort',
					'tiny-case',
					'validator',
					'dayjs',
					'zod'
				]
			}
		}),
		build: {
			...(mode === 'production' && {
				rollupOptions: {
					external: (id) => {
						return false;
					}
				}
			})
		}
	};
});
