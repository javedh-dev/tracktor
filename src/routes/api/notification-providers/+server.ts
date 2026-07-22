import type { RequestHandler } from './$types';
import * as providerService from '$server/services/notificationProviderService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification providers GET error:', async () => {
    const result = await providerService.getAllProviders();
    return jsonResponse(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification providers POST error:', async () => {
    const body = await event.request.json();

    const result = await providerService.addProvider(body);
    return jsonResponse(result, undefined, { status: 201 });
  });
};
