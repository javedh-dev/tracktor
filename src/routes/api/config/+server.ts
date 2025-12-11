import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as configController from '$server/controllers/configController';

export const GET: RequestHandler = async (event) => {
	try {
		const response = await configController.getConfig(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Config GET error:', err);
		throw error(500, 'Internal server error');
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const body = await event.request.json();

		// Validate that body is an array of config objects
		if (!Array.isArray(body)) {
			throw error(400, 'Request body must be an array of config objects');
		}

		// Validate each config object
		for (const config of body) {
			if (!config.key || typeof config.key !== 'string') {
				throw error(400, 'Each config object must have a valid key');
			}
			if (config.value === undefined || config.value === null) {
				throw error(400, 'Each config object must have a value');
			}
		}

		const response = await configController.updateConfig(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Config PUT error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
