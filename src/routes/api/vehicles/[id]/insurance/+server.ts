import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as insuranceService from '$server/services/insuranceService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		const result = await insuranceService.getInsurances(id);
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

export const POST: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || await event.request.json();

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

		const result = await insuranceService.addInsurance(id, body);
		return json(result, { status: 201 });
	} catch (err) {
		console.error('Insurance POST error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};