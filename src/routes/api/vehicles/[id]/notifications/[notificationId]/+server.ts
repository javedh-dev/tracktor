import { requestAccess } from '$server/services/access';
import type { RequestHandler } from './$types';
import * as notificationService from '$server/services/notificationService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const PATCH: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification PATCH error:', async () => {
    const { notificationId } = event.params;
    const result = await notificationService.markNotificationAsRead(
      requestAccess(event),
      event.params.id,
      notificationId
    );
    return jsonResponse(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification DELETE error:', async () => {
    const { notificationId } = event.params;
    const result = await notificationService.clearNotification(
      requestAccess(event),
      event.params.id,
      notificationId
    );
    return jsonResponse(result);
  });
};
