import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as vehicleService from '$server/services/vehicleService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const result = await vehicleService.getAllVehicles();
		return json(result);
	} catch (err) {
		console.error('Vehicles GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		throw error(500, 'Internal server error');
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || (await event.request.json());

		// Basic validation for required vehicle fields
		if (!body.make || !body.model || !body.year) {
			throw error(400, 'Make, model, and year are required');
		}

		if (
			typeof body.year !== 'number' ||
			body.year < 1900 ||
			body.year > new Date().getFullYear() + 1
		) {
			throw error(400, 'Invalid year');
		}

		const result = await vehicleService.addVehicle(body);
		return json(result, { status: 201 });
	} catch (err) {
		console.error('Vehicles POST error:', err);

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
		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || (await event.request.json());

		// Validate required fields for update
		if (!body.id) {
			throw error(400, 'Vehicle ID is required for update');
		}

		if (
			body.year &&
			(typeof body.year !== 'number' ||
				body.year < 1900 ||
				body.year > new Date().getFullYear() + 1)
		) {
			throw error(400, 'Invalid year');
		}

		const result = await vehicleService.updateVehicle(body.id, body);
		return json(result);
	} catch (err) {
		console.error('Vehicles PUT error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
