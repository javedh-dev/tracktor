import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

import { getProviderById } from '$server/services/notificationProviderService';
import { testNotificationProvider } from '$server/services/notification-provider-test.service';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider test POST error:', async () => {
    const body = await event.request.json();
    const providerId = event.params.id;

    if (!providerId) {
      throw error(400, 'Provider ID is required');
    }

    const provider = await getProviderById(providerId);

    if (!provider.isEnabled) {
      throw error(400, 'Provider is disabled');
    }

    const testResult = await testNotificationProvider(provider, {
      testEmail: body.testEmail,
      testMessage: body.testMessage
    });

    return jsonResponse(
      testResult,
      testResult.success
        ? 'Test notification sent successfully'
        : `Failed to send test notification: ${testResult.error}`
    );
  });
};
