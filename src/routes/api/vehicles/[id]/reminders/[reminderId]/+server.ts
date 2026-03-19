import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as reminderService from '$server/services/reminderService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminder GET error:', async () => {
    const { reminderId } = event.params;

    if (!reminderId) {
      throw error(400, 'Reminder ID is required');
    }

    const result = await reminderService.getReminderById(reminderId);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminder PUT error:', async () => {
    const { id, reminderId } = event.params;

    if (!id || !reminderId) {
      throw error(400, 'Vehicle ID and reminder ID are required');
    }

    const body = event.locals.requestBody || (await event.request.json());

    const result = await reminderService.updateReminder(id, reminderId, body);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminder DELETE error:', async () => {
    const { reminderId } = event.params;

    if (!reminderId) {
      throw error(400, 'Reminder ID is required');
    }

    const result = await reminderService.deleteReminder(reminderId);
    return json(result);
  });
};
