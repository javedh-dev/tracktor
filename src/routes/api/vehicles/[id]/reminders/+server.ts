import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as reminderService from '$server/services/reminderService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminders GET error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    const result = await reminderService.getReminders(id);
    return json(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminders POST error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    const body = event.locals.requestBody || (await event.request.json());

    if (!body.dueDate || !body.type || !body.remindSchedule) {
      throw error(400, 'Due date, type, and remind schedule are required');
    }

    const result = await reminderService.addReminder(id, body);
    return json(result, { status: 201 });
  });
};
