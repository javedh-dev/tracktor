import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as providerService from '$server/services/notificationProviderService';
import { AppError } from '$server/exceptions/AppError';
import { ZodError } from 'zod';

export const GET: RequestHandler = async (event) => {
	try {
		const result = await providerService.getProvidersByUserId();
		return json(result);
	} catch (err) {
		console.error('Notification providers GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const body = event.locals.requestBody || (await event.request.json());

		const result = await providerService.addProvider(body);
		return json(result, { status: 201 });
	} catch (err) {
		console.error('Notification providers POST error:', err);

		if (err instanceof ZodError) {
			throw error(400, `Validation error: ${err.issues.map((e) => e.message).join(', ')}`);
		}

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
