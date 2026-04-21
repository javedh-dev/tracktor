import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as fuelLogService from '$server/services/fuelLogService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Fuel log GET error:', async () => {
    const { logId } = event.params;

    if (!logId) {
      throw error(400, 'Fuel log ID is required');
    }

    const result = await fuelLogService.getFuelLogById(logId);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Fuel log PUT error:', async () => {
    const { id, logId } = event.params;

    if (!id || !logId) {
      throw error(400, 'Vehicle ID and fuel log ID are required');
    }

    // Use body from locals if available (from middleware), otherwise parse it
    const body = event.locals.requestBody || (await event.request.json());

    // Validation for optional fuel amount updates
    if (body.fuelAmount !== undefined && body.fuelAmount !== null) {
      if (typeof body.fuelAmount !== 'number' || body.fuelAmount <= 0) {
        throw error(400, 'Fuel amount must be a positive number');
      }
    }

    // Validation for optional odometer updates
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

    if (body.cost !== undefined && body.cost !== null) {
      if (typeof body.cost !== 'number' || body.cost <= 0) {
        throw error(400, 'Cost must be a positive number');
      }
    }

    const result = await fuelLogService.updateFuelLog(id, logId, body);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Fuel log DELETE error:', async () => {
    const { logId } = event.params;

    if (!logId) {
      throw error(400, 'Fuel log ID is required');
    }

    const result = await fuelLogService.deleteFuelLog(logId);
    return json(result);
  });
};
