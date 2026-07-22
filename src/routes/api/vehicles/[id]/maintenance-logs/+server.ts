import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import * as maintenanceLogService from '$server/services/maintenanceLogService';
import { maintenanceSchema } from '$lib/domain/maintenance';
import { parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance logs GET error:', async () => {
    const { id } = event.params;
    const result = await maintenanceLogService.getMaintenanceLogs(id);
    return json(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance logs POST error:', async () => {
    const { id } = event.params;
    const parsed = await parseBody(event, maintenanceSchema, { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await maintenanceLogService.addMaintenanceLog(id, body);
    return json(result, { status: 201 });
  });
};
