import { requestAccess, requireAdmin } from '$server/services/access';
import type { RequestHandler } from './$types';
import * as providerService from '$server/services/notificationProviderService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification providers GET error:', async () => {
    requireAdmin(requestAccess(event));
    const result = await providerService.getAllProviders(requestAccess(event));
    return jsonResponse(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification providers POST error:', async () => {
    requireAdmin(requestAccess(event));
    const body = await event.request.json();

    const result = await providerService.addProvider(requestAccess(event), body);
    return jsonResponse(result, undefined, { status: 201 });
  });
};
