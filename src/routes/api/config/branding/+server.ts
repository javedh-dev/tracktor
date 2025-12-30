import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { getAppConfigByKey } from '$server/services/configService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (_) => {
	try {
		const result = await getAppConfigByKey('customCss');
		return json(result);
	} catch (err) {
		console.error('Custom CSS GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		throw error(500, 'Internal server error');
	}
};
