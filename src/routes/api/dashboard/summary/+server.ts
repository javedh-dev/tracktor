import { requestAccess } from '$server/services/access';
import type { RequestHandler } from './$types';
import { getDashboardSummary } from '$server/services/dashboardService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Dashboard summary GET error:', async () => {
    const summary = await getDashboardSummary(requestAccess(event));
    return jsonResponse(summary);
  });
};
