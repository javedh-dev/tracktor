import type { RequestHandler } from './$types';
import * as maintenanceLogService from '$server/services/maintenanceLogService';
import { maintenanceSchema } from '$lib/domain/maintenance';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance logs GET error:', async () => {
    const { id } = event.params;
    const result = await maintenanceLogService.getMaintenanceLogs(id);
    return jsonResponse(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance logs POST error:', async () => {
    const { id } = event.params;
    const parsed = await parseBody(event, maintenanceSchema, { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await maintenanceLogService.addMaintenanceLog(id, body);
    return jsonResponse(result, undefined, { status: 201 });
  });
};
