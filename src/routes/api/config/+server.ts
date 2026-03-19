import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { getAppConfigs, updateAppConfig } from '$server/services/configService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Config GET error:', async () => {
    const result = await getAppConfigs();
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Config PUT error:', async () => {
    // Use body from locals if available (from middleware), otherwise parse it
    const body = event.locals.requestBody || (await event.request.json());

    // Validate that body is an array of config objects
    if (!Array.isArray(body)) {
      throw error(400, 'Request body must be an array of config objects');
    }

    // Validate each config object
    for (const config of body) {
      if (!config.key || typeof config.key !== 'string') {
        throw error(400, 'Each config object must have a valid key');
      }
      if (config.value === undefined || config.value === null) {
        throw error(400, 'Each config object must have a value');
      }
    }

    const result = await updateAppConfig(body);
    return json(result);
  });
};
