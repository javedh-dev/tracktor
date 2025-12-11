import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		message: 'SvelteKit consolidation API is working',
		timestamp: new Date().toISOString()
	});
};
