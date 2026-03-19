import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as providerService from '$server/services/notificationProviderService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider GET error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Provider ID is required');
    }

    const result = await providerService.getProviderById(id);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider PUT error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Provider ID is required');
    }

    const body = event.locals.requestBody || (await event.request.json());

    const result = await providerService.updateProvider(id, body);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider DELETE error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Provider ID is required');
    }

    const result = await providerService.deleteProvider(id);
    return json(result);
  });
};
