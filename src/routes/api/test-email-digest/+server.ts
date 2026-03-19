import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { dispatchScheduledNotifications } from '$server/services/notificationDispatchService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async () => {
  return withRouteErrorHandling('Test email digest POST error:', async () => {
    const result = await dispatchScheduledNotifications();
    return json(result);
  });
};
