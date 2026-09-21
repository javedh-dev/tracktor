import type { RequestHandler } from './$types';
import * as providerService from '$server/services/notificationProviderService';
import { maskProviderSecrets } from '$server/services/notification-provider-service.helper';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider GET error:', async () => {
    const { id } = event.params;
    const result = await providerService.getProviderById(id);
    return jsonResponse(maskProviderSecrets(result));
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider PUT error:', async () => {
    const { id } = event.params;
    const body = await event.request.json();
    const result = await providerService.updateProvider(id, body);
    return jsonResponse(maskProviderSecrets(result));
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider DELETE error:', async () => {
    const { id } = event.params;
    const result = await providerService.deleteProvider(id);
    return jsonResponse(result);
  });
};
