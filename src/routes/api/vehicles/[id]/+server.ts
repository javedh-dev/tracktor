import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as vehicleService from '$server/services/vehicleService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicle GET error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    const result = await vehicleService.getVehicleById(id);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicle DELETE error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    const result = await vehicleService.deleteVehicle(id);
    return json(result);
  });
};
