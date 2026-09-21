import type { RequestHandler } from './$types';
import * as providerService from '$server/services/notificationProviderService';
import {
  maskProvidersSecrets,
  maskProviderSecrets
} from '$server/services/notification-provider-service.helper';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification providers GET error:', async () => {
    const result = await providerService.getAllProviders();
    return jsonResponse(maskProvidersSecrets(result));
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification providers POST error:', async () => {
    const body = await event.request.json();

    const result = await providerService.addProvider(body);
    return jsonResponse(maskProviderSecrets(result), undefined, { status: 201 });
  });
};
