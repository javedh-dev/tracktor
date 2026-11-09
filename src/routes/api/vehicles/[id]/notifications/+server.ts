import { requestAccess } from '$server/services/access';
import type { RequestHandler } from './$types';
import * as notificationService from '$server/services/notificationService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notifications GET error:', async () => {
    const { id } = event.params;
    const result = await notificationService.getNotifications(requestAccess(event), id);
    return jsonResponse(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notifications PUT error:', async () => {
    const { id } = event.params;
    const result = await notificationService.markAllNotificationsAsRead(requestAccess(event), id);
    return jsonResponse(result);
  });
};
