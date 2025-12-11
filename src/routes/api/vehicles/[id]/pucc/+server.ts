import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as puccController from '$server/controllers/puccController';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		// Controllers now handle parameter mapping

		const response = await puccController.getPuccs(event);
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

export const POST: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		const body = await event.request.json();

		// Basic validation for PUCC data
		if (!body.certificateNumber || !body.issueDate || !body.expiryDate) {
			throw error(400, 'Certificate number, issue date, and expiry date are required');
		}

		// Validate dates
		const issueDate = new Date(body.issueDate);
		const expiryDate = new Date(body.expiryDate);

		if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
			throw error(400, 'Invalid date format');
		}

		if (expiryDate <= issueDate) {
			throw error(400, 'Expiry date must be after issue date');
		}

		// Controllers now handle parameter mapping

		const response = await puccController.addPucc(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('PUCC POST error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
