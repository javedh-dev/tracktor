import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as configController from '$server/controllers/configController';

export const GET: RequestHandler = async (event) => {
	try {
		const { key } = event.params;

		if (!key) {
			throw error(400, 'Config key is required');
		}

		const response = await configController.getConfigByKey(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Config key GET error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
