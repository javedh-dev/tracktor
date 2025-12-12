import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as fuelLogService from '$server/services/fuelLogService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { logId } = event.params;

		if (!logId) {
			throw error(400, 'Fuel log ID is required');
		}

		const result = await fuelLogService.getFuelLogById(logId);
		return json(result);
	} catch (err) {
		console.error('Fuel log GET error:', err);

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
		const { id, logId } = event.params;

		if (!id || !logId) {
			throw error(400, 'Vehicle ID and fuel log ID are required');
		}

		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || await event.request.json();

		// Validation for fuel log updates
		if (body.amount && (typeof body.amount !== 'number' || body.amount <= 0)) {
			throw error(400, 'Amount must be a positive number');
		}

		if (body.cost && (typeof body.cost !== 'number' || body.cost <= 0)) {
			throw error(400, 'Cost must be a positive number');
		}

		const result = await fuelLogService.updateFuelLog(id, logId, body);
		return json(result);
	} catch (err) {
		console.error('Fuel log PUT error:', err);

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
		const { logId } = event.params;

		if (!logId) {
			throw error(400, 'Fuel log ID is required');
		}

		const result = await fuelLogService.deleteFuelLog(logId);
		return json(result);
	} catch (err) {
		console.error('Fuel log DELETE error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};