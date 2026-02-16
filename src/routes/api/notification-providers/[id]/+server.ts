import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as providerService from '$server/services/notificationProviderService';
import { AppError } from '$server/exceptions/AppError';
import { ZodError } from 'zod';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Provider ID is required');
		}

		const result = await providerService.getProviderById(id);
		return json(result);
	} catch (err) {
		console.error('Notification provider GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Provider ID is required');
		}

		const body = event.locals.requestBody || (await event.request.json());

		const result = await providerService.updateProvider(id, body);
		return json(result);
	} catch (err) {
		console.error('Notification provider PUT error:', err);

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

export const DELETE: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Provider ID is required');
		}

		const result = await providerService.deleteProvider(id);
		return json(result);
	} catch (err) {
		console.error('Notification provider DELETE error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
