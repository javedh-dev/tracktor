import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import * as reminderService from '$server/services/reminderService';
import { reminderSchema } from '$lib/domain/reminder';
import { parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminders GET error:', async () => {
    const { id } = event.params;
    const result = await reminderService.getReminders(id);
    return json(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminders POST error:', async () => {
    const { id } = event.params;
    const parsed = await parseBody(event, reminderSchema, { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await reminderService.addReminder(id, body);
    return json(result, { status: 201 });
  });
};
