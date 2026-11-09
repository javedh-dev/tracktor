import { requestAccess } from '$server/services/access';
import type { RequestHandler } from './$types';
import * as maintenanceLogService from '$server/services/maintenanceLogService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  const { url } = event;
  return withRouteErrorHandling('Maintenance logs GET error:', async () => {
    const vehicleId = url.searchParams.get('vehicleId') ?? undefined;
    const result = await maintenanceLogService.getMaintenanceLogs(requestAccess(event), vehicleId);
    return jsonResponse(result);
  });
};
