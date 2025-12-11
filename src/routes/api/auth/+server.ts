import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as authController from '$server/controllers/authController';

export const POST: RequestHandler = async (event) => {
	try {
		const body = await event.request.json();

		// Validate request body
		if (!body.pin) {
			throw error(400, 'PIN is required');
		}

		const response = await authController.verifyPin(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Auth POST error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};

export const GET: RequestHandler = async (event) => {
	try {
		const response = await authController.getPinStatus(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Auth GET error:', err);
		throw error(500, 'Internal server error');
	}
};
