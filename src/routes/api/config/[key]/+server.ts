import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { getAppConfigByKey } from '$server/services/configService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Config key GET error:', async () => {
    const { key } = event.params;

    if (!key) {
      throw error(400, 'Config key is required');
    }

    const result = await getAppConfigByKey(key);
    return json(result);
  });
};
