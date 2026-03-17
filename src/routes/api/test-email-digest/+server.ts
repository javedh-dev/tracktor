import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

import { AppError } from '$server/exceptions/AppError';
import { dispatchScheduledNotifications } from '$server/services/notificationDispatchService';

export const POST: RequestHandler = async () => {
  try {
    const result = await dispatchScheduledNotifications();
    return json(result);
  } catch (err) {
    if (err instanceof AppError) {
      throw error(err.status, err.message);
    }

    throw error(500, 'Internal server error');
  }
};
