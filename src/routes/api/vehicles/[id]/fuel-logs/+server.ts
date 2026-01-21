import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as fuelLogService from '$server/services/fuelLogService';
import { AppError } from '$server/exceptions/AppError';
import { fuelSchema } from '$lib/domain/fuel';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		const result = await fuelLogService.getFuelLogs(id);
		return json(result);
	} catch (err) {
		console.error('Fuel logs GET error:', err);

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
		const body = event.locals.requestBody || (await event.request.json());

		// Basic validation for required fields
		if (!body.date || body.cost === undefined || body.cost === null) {
			throw error(400, 'Date and cost are required');
		}

		// Validate optional fields if provided
		if (body.fuelAmount !== undefined && body.fuelAmount !== null) {
			if (typeof body.fuelAmount !== 'number' || body.fuelAmount <= 0) {
				throw error(400, 'Fuel amount must be a positive number');
			}
		}

		if (body.odometer !== undefined && body.odometer !== null) {
			if (typeof body.odometer !== 'number' || body.odometer <= 0) {
				throw error(400, 'Odometer must be a positive number');
			}
		}

		if (typeof body.cost !== 'number' || body.cost <= 0) {
			throw error(400, 'Cost must be a positive number');
		}

		// Validate against schema
		const validationResult = fuelSchema.safeParse({ ...body, vehicleId: id });
		if (!validationResult.success) {
			const errors = validationResult.error.flatten();
			throw error(400, `Validation failed: ${JSON.stringify(errors.fieldErrors)}`);
		}

		const result = await fuelLogService.addFuelLog(id, body);
		return json(result, { status: 201 });
	} catch (err) {
		console.error('Fuel logs POST error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
