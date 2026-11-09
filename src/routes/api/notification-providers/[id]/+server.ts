import { requestAccess, requireAdmin } from '$server/services/access';
import type { RequestHandler } from './$types';
import * as providerService from '$server/services/notificationProviderService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider GET error:', async () => {
    requireAdmin(requestAccess(event));
    const { id } = event.params;
    const result = await providerService.getProviderById(requestAccess(event), id);
    return jsonResponse(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider PUT error:', async () => {
    requireAdmin(requestAccess(event));
    const { id } = event.params;
    const body = await event.request.json();
    const result = await providerService.updateProvider(requestAccess(event), id, body);
    return jsonResponse(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider DELETE error:', async () => {
    requireAdmin(requestAccess(event));
    const { id } = event.params;
    const result = await providerService.deleteProvider(requestAccess(event), id);
    return jsonResponse(result);
  });
};
