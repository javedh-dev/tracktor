import { requestAccess } from '$server/services/access';
import type { RequestHandler } from './$types';
import * as notificationService from '$server/services/notificationService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notifications GET error:', async () => {
    const result = await notificationService.getAllNotifications(requestAccess(event));
    return jsonResponse(result);
  });
};
