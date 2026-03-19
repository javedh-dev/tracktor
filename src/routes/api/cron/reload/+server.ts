import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { reloadNotificationScheduler } from '$server/services/notificationSchedulerService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async () => {
  return withRouteErrorHandling(
    'Cron reload POST error:',
    async () => {
      await reloadNotificationScheduler();

      return json({
        success: true,
        message: 'Notification scheduler reloaded successfully'
      });
    },
    'Failed to reload notification scheduler'
  );
};
