import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as authService from '$server/services/authService';
import { AppError } from '$server/exceptions/AppError';

export const POST: RequestHandler = async (event) => {
	try {
		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || await event.request.json();

		// Validate request body
		if (!body.pin) {
			throw error(400, 'PIN is required');
		}

		const result = await authService.verifyPin(body.pin);
		return json(result);
	} catch (err) {
		console.error('Auth POST error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};

export const GET: RequestHandler = async (event) => {
	try {
		const result = await authService.getPinStatus();
		return json(result);
	} catch (err) {
		console.error('Auth GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		throw error(500, 'Internal server error');
	}
};