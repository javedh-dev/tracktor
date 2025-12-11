import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as maintenanceLogController from '$server/controllers/maintenanceLogController';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		// Controllers now handle parameter mapping

		const response = await maintenanceLogController.getMaintenanceLogs(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Maintenance logs GET error:', err);
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

		// Basic validation for maintenance log data
		if (!body.type || !body.description || !body.date) {
			throw error(400, 'Type, description, and date are required');
		}

		// Validate date
		const date = new Date(body.date);
		if (isNaN(date.getTime())) {
			throw error(400, 'Invalid date format');
		}

		// Validate cost if provided
		if (body.cost && (typeof body.cost !== 'number' || body.cost < 0)) {
			throw error(400, 'Cost must be a non-negative number');
		}

		// Controllers now handle parameter mapping

		const response = await maintenanceLogController.addMaintenanceLog(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Maintenance logs POST error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
