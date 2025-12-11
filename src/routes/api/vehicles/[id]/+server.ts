import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as vehicleController from '$server/controllers/vehicleController';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		const response = await vehicleController.getVehicleById(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Vehicle GET error:', err);
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
			throw error(400, 'Vehicle ID is required');
		}

		const response = await vehicleController.deleteVehicle(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Vehicle DELETE error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
