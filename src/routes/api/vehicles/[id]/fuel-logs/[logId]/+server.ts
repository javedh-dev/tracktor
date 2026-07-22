import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import * as fuelLogService from '$server/services/fuelLogService';
import { fuelSchema } from '$lib/domain/fuel';
import { parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Fuel log GET error:', async () => {
    const { logId } = event.params;
    const result = await fuelLogService.getFuelLogById(logId);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Fuel log PUT error:', async () => {
    const { id, logId } = event.params;
    const parsed = await parseBody(event, fuelSchema.partial(), { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await fuelLogService.updateFuelLog(id, logId, body);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Fuel log DELETE error:', async () => {
    const { logId } = event.params;
    const result = await fuelLogService.deleteFuelLog(logId);
    return json(result);
  });
};
