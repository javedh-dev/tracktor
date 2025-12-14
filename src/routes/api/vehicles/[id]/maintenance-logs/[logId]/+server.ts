import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as maintenanceLogService from '$server/services/maintenanceLogService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { logId } = event.params;

		if (!logId) {
			throw error(400, 'Maintenance log ID is required');
		}

		const result = await maintenanceLogService.getMaintenanceLogById(logId);
		return json(result);
	} catch (err) {
		console.error('Maintenance log GET error:', err);

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
		const { logId } = event.params;

		if (!logId) {
			throw error(400, 'Maintenance log ID is required');
		}

		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || (await event.request.json());

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

		const result = await maintenanceLogService.updateMaintenanceLog(logId, body);
		return json(result);
	} catch (err) {
		console.error('Maintenance log PUT error:', err);

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
			throw error(400, 'Maintenance log ID is required');
		}

		const result = await maintenanceLogService.deleteMaintenanceLog(logId);
		return json(result);
	} catch (err) {
		console.error('Maintenance log DELETE error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
