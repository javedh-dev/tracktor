import type { RequestHandler } from './$types';
import * as notificationService from '$server/services/notificationService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async () => {
  return withRouteErrorHandling('Notifications GET error:', async () => {
    const result = await notificationService.getAllNotifications();
    return jsonResponse(result);
  });
};
