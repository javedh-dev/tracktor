import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getAppConfigByKey } from '$server/services/configService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (_) => {
  return withRouteErrorHandling('Branding GET error:', async () => {
    const result = await getAppConfigByKey('customCss');
    return json(result);
  });
};
