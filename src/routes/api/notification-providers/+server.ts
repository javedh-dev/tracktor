import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import * as providerService from '$server/services/notificationProviderService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification providers GET error:', async () => {
    const result = await providerService.getProvidersByUserId();
    return json(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification providers POST error:', async () => {
    const body = event.locals.requestBody || (await event.request.json());

    const result = await providerService.addProvider(body);
    return json(result, { status: 201 });
  });
};
