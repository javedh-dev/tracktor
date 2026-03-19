import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as notificationService from '$server/services/notificationService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const PATCH: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification PATCH error:', async () => {
    const { notificationId } = event.params;

    if (!notificationId) {
      throw error(400, 'Notification ID is required');
    }

    const result = await notificationService.markNotificationAsRead(notificationId);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification DELETE error:', async () => {
    const { notificationId } = event.params;

    if (!notificationId) {
      throw error(400, 'Notification ID is required');
    }

    const result = await notificationService.clearNotification(notificationId);
    return json(result);
  });
};
