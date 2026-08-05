import type { RequestHandler } from './$types';
import { getDashboardSummary } from '$server/services/dashboardService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async () => {
  return withRouteErrorHandling('Dashboard summary GET error:', async () => {
    const summary = await getDashboardSummary();
    return jsonResponse(summary);
  });
};
