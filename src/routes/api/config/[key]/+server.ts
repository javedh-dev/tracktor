import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { getAppConfigByKey } from '$server/services/configService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { key } = event.params;

		if (!key) {
			throw error(400, 'Config key is required');
		}

		const result = await getAppConfigByKey(key);
		return json(result);
	} catch (err) {
		console.error('Config key GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
