import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as insuranceController from '$server/controllers/insuranceController';

export const GET: RequestHandler = async (event) => {
	try {
		const { insuranceId } = event.params;

		if (!insuranceId) {
			throw error(400, 'Insurance ID is required');
		}

		// Update event params to match controller expectations
		event.params.id = insuranceId;

		const response = await insuranceController.getInsuranceById(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Insurance GET error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const { id, insuranceId } = event.params;

		if (!id || !insuranceId) {
			throw error(400, 'Vehicle ID and insurance ID are required');
		}

		const body = await event.request.json();

		// Validation for insurance updates
		if (body.startDate && body.endDate) {
			const startDate = new Date(body.startDate);
			const endDate = new Date(body.endDate);

			if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
				throw error(400, 'Invalid date format');
			}

			if (endDate <= startDate) {
				throw error(400, 'End date must be after start date');
			}
		}

		// Update event params to match controller expectations
		(event.params as any).vehicleId = id;
		(event.params as any).insuranceId = insuranceId;

		const response = await insuranceController.updateInsurance(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Insurance PUT error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const { insuranceId } = event.params;

		if (!insuranceId) {
			throw error(400, 'Insurance ID is required');
		}

		// Update event params to match controller expectations
		event.params.id = insuranceId;

		const response = await insuranceController.deleteInsurance(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Insurance DELETE error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
