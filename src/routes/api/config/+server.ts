import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { getAppConfigs, updateAppConfig } from '$server/services/configService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const result = await getAppConfigs();
		return json(result);
	} catch (err) {
		console.error('Config GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		throw error(500, 'Internal server error');
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || (await event.request.json());

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

		const result = await updateAppConfig(body);
		return json(result);
	} catch (err) {
		console.error('Config PUT error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
