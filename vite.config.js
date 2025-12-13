import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode = 'development' }) => {
	console.log('Building in mode : ', mode);

	return {
		plugins: [tailwindcss(), sveltekit()]
	};
});
