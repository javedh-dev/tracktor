import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode = 'dev' }) => {
	console.log('Building in mode : ', mode);
	const getApiUrl = () => {
		switch (mode) {
			case 'test':
				return 'http://localhost:3001';
			default:
				return 'http://localhost:3000';
		}
	};

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
			host: '0.0.0.0',
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
