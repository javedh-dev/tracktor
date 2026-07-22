import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import * as maintenanceLogService from '$server/services/maintenanceLogService';
import { maintenanceSchema } from '$lib/domain/maintenance';
import { parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance log GET error:', async () => {
    const { logId } = event.params;
    const result = await maintenanceLogService.getMaintenanceLogById(logId);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance log PUT error:', async () => {
    const { id: vehicleId, logId } = event.params;
    const parsed = await parseBody(event, maintenanceSchema.partial(), { vehicleId });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await maintenanceLogService.updateMaintenanceLog(vehicleId, logId, body);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance log DELETE error:', async () => {
    const { id: vehicleId, logId } = event.params;
    const result = await maintenanceLogService.deleteMaintenanceLog(vehicleId, logId);
    return json(result);
  });
};
