import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

import { AppError } from '$server/exceptions/AppError';
import { reloadNotificationScheduler } from '$server/services/notificationSchedulerService';

export const POST: RequestHandler = async () => {
  try {
    await reloadNotificationScheduler();

    return json({
      success: true,
      message: 'Notification scheduler reloaded successfully'
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw error(err.status, err.message);
    }

    throw error(500, 'Failed to reload notification scheduler');
  }
};
