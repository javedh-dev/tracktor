import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as vehicleController from '$server/controllers/vehicleController';

export const GET: RequestHandler = async (event) => {
	try {
		const response = await vehicleController.getAllVehicles(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Vehicles GET error:', err);
		throw error(500, 'Internal server error');
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const body = await event.request.json();

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

		const response = await vehicleController.addVehicle(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Vehicles POST error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const body = await event.request.json();

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

		const response = await vehicleController.updateVehicle(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Vehicles PUT error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
