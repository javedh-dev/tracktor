import { requestAccess } from '$server/services/access';
import type { RequestHandler } from './$types';
import * as reminderService from '$server/services/reminderService';
import { reminderSchema } from '$lib/domain/reminder';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Reminders POST error:', async () => {
    const { id } = event.params;
    const parsed = await parseBody(event, reminderSchema, { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await reminderService.addReminder(requestAccess(event), id, body);
    return jsonResponse(result, undefined, { status: 201 });
  });
};
