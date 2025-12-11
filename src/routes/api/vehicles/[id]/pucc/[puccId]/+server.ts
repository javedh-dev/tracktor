import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as puccController from '$server/controllers/puccController';

export const GET: RequestHandler = async (event) => {
	try {
		const { puccId } = event.params;

		if (!puccId) {
			throw error(400, 'PUCC ID is required');
		}

		// Update event params to match controller expectations
		event.params.id = puccId;

		const response = await puccController.getPuccById(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('PUCC GET error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const { id, puccId } = event.params;

		if (!id || !puccId) {
			throw error(400, 'Vehicle ID and PUCC ID are required');
		}

		const body = await event.request.json();

		// Validation for PUCC updates
		if (body.issueDate && body.expiryDate) {
			const issueDate = new Date(body.issueDate);
			const expiryDate = new Date(body.expiryDate);

			if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
				throw error(400, 'Invalid date format');
			}

			if (expiryDate <= issueDate) {
				throw error(400, 'Expiry date must be after issue date');
			}
		}

		// Update event params to match controller expectations
		(event.params as any).vehicleId = id;
		(event.params as any).puccId = puccId;

		const response = await puccController.updatePucc(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('PUCC PUT error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const { puccId } = event.params;

		if (!puccId) {
			throw error(400, 'PUCC ID is required');
		}

		// Update event params to match controller expectations
		event.params.id = puccId;

		const response = await puccController.deletePucc(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('PUCC DELETE error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
