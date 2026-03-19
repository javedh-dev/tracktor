import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as maintenanceLogService from '$server/services/maintenanceLogService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance logs GET error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    const result = await maintenanceLogService.getMaintenanceLogs(id);
    return json(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance logs POST error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    // Use body from locals if available (from middleware), otherwise parse it
    const body = event.locals.requestBody || (await event.request.json());

    // Basic validation for maintenance log data
    if (!body.odometer || !body.serviceCenter || !body.date || !body.cost) {
      throw error(400, 'Odometer, serviceCenter, date, and cost are required');
    }

    // Validate date
    const date = new Date(body.date);
    if (isNaN(date.getTime())) {
      throw error(400, 'Invalid date format');
    }

    // Validate cost if provided
    if (body.cost && (typeof body.cost !== 'number' || body.cost < 0)) {
      throw error(400, 'Cost must be a non-negative number');
    }

    const result = await maintenanceLogService.addMaintenanceLog(id, body);
    return json(result, { status: 201 });
  });
};
