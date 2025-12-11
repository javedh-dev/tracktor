import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as maintenanceLogController from '$server/controllers/maintenanceLogController';

export const GET: RequestHandler = async (event) => {
	try {
		const { logId } = event.params;

		if (!logId) {
			throw error(400, 'Maintenance log ID is required');
		}

		// Update event params to match controller expectations
		event.params.id = logId;

		const response = await maintenanceLogController.getMaintenanceLogById(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Maintenance log GET error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const { logId } = event.params;

		if (!logId) {
			throw error(400, 'Maintenance log ID is required');
		}

		const body = await event.request.json();

		// Validation for maintenance log updates
		if (body.date) {
			const date = new Date(body.date);
			if (isNaN(date.getTime())) {
				throw error(400, 'Invalid date format');
			}
		}

		if (body.cost && (typeof body.cost !== 'number' || body.cost < 0)) {
			throw error(400, 'Cost must be a non-negative number');
		}

		// Update event params to match controller expectations
		event.params.id = logId;

		const response = await maintenanceLogController.updateMaintenanceLog(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Maintenance log PUT error:', err);
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
			throw error(400, 'Maintenance log ID is required');
		}

		// Update event params to match controller expectations
		event.params.id = logId;

		const response = await maintenanceLogController.deleteMaintenanceLog(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Maintenance log DELETE error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
