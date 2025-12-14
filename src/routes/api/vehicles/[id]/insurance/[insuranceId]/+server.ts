import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as insuranceService from '$server/services/insuranceService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { insuranceId } = event.params;

		if (!insuranceId) {
			throw error(400, 'Insurance ID is required');
		}

		const result = await insuranceService.getInsuranceById(insuranceId);
		return json(result);
	} catch (err) {
		console.error('Insurance GET error:', err);

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
		const { id, insuranceId } = event.params;

		if (!id || !insuranceId) {
			throw error(400, 'Vehicle ID and insurance ID are required');
		}

		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || (await event.request.json());

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

		const result = await insuranceService.updateInsurance(id, insuranceId, body);
		return json(result);
	} catch (err) {
		console.error('Insurance PUT error:', err);

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
		const { insuranceId } = event.params;

		if (!insuranceId) {
			throw error(400, 'Insurance ID is required');
		}

		const result = await insuranceService.deleteInsurance(insuranceId);
		return json(result);
	} catch (err) {
		console.error('Insurance DELETE error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
