import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as fuelLogController from '$server/controllers/fuelLogController';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		// Controllers now handle both 'id' and 'vehicleId' parameters

		const response = await fuelLogController.getFuelLogs(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Fuel logs GET error:', err);
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

		const body = await event.request.json();

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

		// Controllers now handle both 'id' and 'vehicleId' parameters

		const response = await fuelLogController.addFuelLog(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Fuel logs POST error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
