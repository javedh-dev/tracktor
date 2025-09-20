import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
	// Load env file from root directory
	console.log('Running in mode : ', mode);
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
					'dayjs'
				]
			}
		}),
		build: {
			...(mode === 'production' && {
				rollupOptions: {
					external: (id) => {
						// Don't bundle these for client-side, but allow them for SSR
						if (id.includes('style-to-object') || id.includes('memoize-weak')) {
							return false;
						}
						return false;
					}
				}
			})
		}
	};
});
