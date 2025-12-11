import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as fuelLogController from '$server/controllers/fuelLogController';

export const GET: RequestHandler = async (event) => {
	try {
		const { logId } = event.params;

		if (!logId) {
			throw error(400, 'Fuel log ID is required');
		}

		// Update event params to match controller expectations
		event.params.id = logId;

		const response = await fuelLogController.getFuelLogById(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Fuel log GET error:', err);
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

		const body = await event.request.json();

		// Validation for fuel log updates
		if (body.amount && (typeof body.amount !== 'number' || body.amount <= 0)) {
			throw error(400, 'Amount must be a positive number');
		}

		if (body.cost && (typeof body.cost !== 'number' || body.cost <= 0)) {
			throw error(400, 'Cost must be a positive number');
		}

		// Controllers now handle both parameter names

		const response = await fuelLogController.updateFuelLog(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Fuel log PUT error:', err);
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

		// Update event params to match controller expectations
		event.params.id = logId;

		const response = await fuelLogController.deleteFuelLog(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Fuel log DELETE error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
