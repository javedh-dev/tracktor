import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { dispatchAllNotificationsToEnabledProviders } from '$server/services/notificationDispatchService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async () => {
  return withRouteErrorHandling('Test enabled providers POST error:', async () => {
    const result = await dispatchAllNotificationsToEnabledProviders();
    return json(result);
  });
};
