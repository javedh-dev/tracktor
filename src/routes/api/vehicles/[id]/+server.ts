import type { RequestHandler } from './$types';
import * as vehicleService from '$server/services/vehicleService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicle GET error:', async () => {
    const { id } = event.params;
    const result = await vehicleService.getVehicleById(id);
    return jsonResponse(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicle DELETE error:', async () => {
    const { id } = event.params;
    const result = await vehicleService.deleteVehicle(id);
    return jsonResponse(result);
  });
};
