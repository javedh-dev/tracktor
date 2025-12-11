import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as insuranceController from '$server/controllers/insuranceController';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		// Controllers now handle both parameter names

		const response = await insuranceController.getInsurances(event);
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

export const POST: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		const body = await event.request.json();

		// Basic validation for insurance data
		if (!body.provider || !body.policyNumber || !body.startDate || !body.endDate) {
			throw error(400, 'Provider, policy number, start date, and end date are required');
		}

		// Validate dates
		const startDate = new Date(body.startDate);
		const endDate = new Date(body.endDate);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			throw error(400, 'Invalid date format');
		}

		if (endDate <= startDate) {
			throw error(400, 'End date must be after start date');
		}

		// Controllers now handle parameter mapping

		const response = await insuranceController.addInsurance(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('Insurance POST error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
