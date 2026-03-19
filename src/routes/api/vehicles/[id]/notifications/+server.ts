import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as notificationService from '$server/services/notificationService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notifications GET error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    const result = await notificationService.getNotifications(id);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notifications PUT error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    const result = await notificationService.markAllNotificationsAsRead(id);
    return json(result, { status: 201 });
  });
};
