import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode = 'development' }) => {
	console.log('Building in mode : ', mode);

	// Load environment variables using Vite's built-in env loading
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [tailwindcss(), sveltekit()],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}'],
			environment: 'jsdom',
			globals: true,
			testTimeout: 10000,
			server: {
				deps: {
					inline: ['@sveltejs/kit']
				}
			}
		},

		server: {
			port: 5173,
			host: '0.0.0.0'
		},

		envDir: process.cwd(),

		define: {
			// Make environment variables available at build time
			'process.env.NODE_ENV': JSON.stringify(mode),
			'process.env.SERVER_PORT': JSON.stringify(env.SERVER_PORT || '3000'),
			'process.env.DB_PATH': JSON.stringify(env.DB_PATH || './tracktor.db')
		},

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
