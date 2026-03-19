import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as maintenanceLogService from '$server/services/maintenanceLogService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance log GET error:', async () => {
    const { logId } = event.params;

    if (!logId) {
      throw error(400, 'Maintenance log ID is required');
    }

    const result = await maintenanceLogService.getMaintenanceLogById(logId);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance log PUT error:', async () => {
    const { logId } = event.params;

    if (!logId) {
      throw error(400, 'Maintenance log ID is required');
    }

    // Use body from locals if available (from middleware), otherwise parse it
    const body = event.locals.requestBody || (await event.request.json());

    // Validation for maintenance log updates
    if (body.date) {
      const date = new Date(body.date);
      if (isNaN(date.getTime())) {
        throw error(400, 'Invalid date format');
      }
    }

    if (body.cost && (typeof body.cost !== 'number' || body.cost < 0)) {
      throw error(400, 'Cost must be a non-negative number');
    }

    const result = await maintenanceLogService.updateMaintenanceLog(logId, body);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance log DELETE error:', async () => {
    const { logId } = event.params;

    if (!logId) {
      throw error(400, 'Maintenance log ID is required');
    }

    const result = await maintenanceLogService.deleteMaintenanceLog(logId);
    return json(result);
  });
};
