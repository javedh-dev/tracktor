import { requestAccess } from '$server/services/access';
import type { RequestHandler } from './$types';
import * as fuelLogService from '$server/services/fuelLogService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  const { url } = event;
  return withRouteErrorHandling('Fuel logs GET error:', async () => {
    const vehicleId = url.searchParams.get('vehicleId') ?? undefined;
    const result = await fuelLogService.getFuelLogs(requestAccess(event), vehicleId);
    return jsonResponse(result);
  });
};
