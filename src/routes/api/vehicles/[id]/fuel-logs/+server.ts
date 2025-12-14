import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as fuelLogService from '$server/services/fuelLogService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		const result = await fuelLogService.getFuelLogs(id);
		return json(result);
	} catch (err) {
		console.error('Fuel logs GET error:', err);

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
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || (await event.request.json());

		// Basic validation for fuel log data
		if (!body.date || !body.amount || !body.cost) {
			throw error(400, 'Date, amount, and cost are required');
		}

		if (typeof body.amount !== 'number' || body.amount <= 0) {
			throw error(400, 'Amount must be a positive number');
		}

		if (typeof body.cost !== 'number' || body.cost <= 0) {
			throw error(400, 'Cost must be a positive number');
		}

		const result = await fuelLogService.addFuelLog(id, body);
		return json(result, { status: 201 });
	} catch (err) {
		console.error('Fuel logs POST error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
