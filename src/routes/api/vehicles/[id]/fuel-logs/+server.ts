import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as fuelLogService from '$server/services/fuelLogService';
import { fuelSchema } from '$lib/domain/fuel';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Fuel logs GET error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    const result = await fuelLogService.getFuelLogs(id);
    return json(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Fuel logs POST error:', async () => {
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

    if (body.rate !== undefined && body.rate !== null) {
      if (typeof body.rate !== 'number' || body.rate <= 0) {
        throw error(400, 'Rate must be a positive number');
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
  });
};
