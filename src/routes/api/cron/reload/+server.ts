import type { RequestHandler } from './$types';
import { reloadNotificationScheduler } from '$server/services/notificationSchedulerService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async () => {
  return withRouteErrorHandling(
    'Cron reload POST error:',
    async () => {
      await reloadNotificationScheduler();

      return jsonResponse(undefined, 'Notification scheduler reloaded successfully');
    },
    'Failed to reload notification scheduler'
  );
};
