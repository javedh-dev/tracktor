import type { RequestHandler } from './$types';
import * as reminderService from '$server/services/reminderService';
import { reminderSchema } from '$lib/domain/reminder';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminder GET error:', async () => {
    const { reminderId } = event.params;
    const result = await reminderService.getReminderById(reminderId);
    return jsonResponse(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminder PUT error:', async () => {
    const { id, reminderId } = event.params;
    const parsed = await parseBody(event, reminderSchema.partial(), { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await reminderService.updateReminder(id, reminderId, body);
    return jsonResponse(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminder DELETE error:', async () => {
    const { reminderId } = event.params;
    const result = await reminderService.deleteReminder(reminderId);
    return jsonResponse(result);
  });
};
