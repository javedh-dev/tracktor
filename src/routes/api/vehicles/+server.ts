import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as vehicleService from '$server/services/vehicleService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicles GET error:', async () => {
    const result = await vehicleService.getAllVehicles();
    return json(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicles POST error:', async () => {
    // Use body from locals if available (from middleware), otherwise parse it
    const body = event.locals.requestBody || (await event.request.json());

    // Basic validation for required vehicle fields
    if (!body.make || !body.model || !body.year) {
      throw error(400, 'Make, model, and year are required');
    }

    if (
      typeof body.year !== 'number' ||
      body.year < 1900 ||
      body.year > new Date().getFullYear() + 1
    ) {
      throw error(400, 'Invalid year');
    }

    const result = await vehicleService.addVehicle(body);
    return json(result, { status: 201 });
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicles PUT error:', async () => {
    // Use body from locals if available (from middleware), otherwise parse it
    const body = event.locals.requestBody || (await event.request.json());

    // Validate required fields for update
    if (!body.id) {
      throw error(400, 'Vehicle ID is required for update');
    }

    if (
      body.year &&
      (typeof body.year !== 'number' ||
        body.year < 1900 ||
        body.year > new Date().getFullYear() + 1)
    ) {
      throw error(400, 'Invalid year');
    }

    const result = await vehicleService.updateVehicle(body.id, body);
    return json(result);
  });
};
