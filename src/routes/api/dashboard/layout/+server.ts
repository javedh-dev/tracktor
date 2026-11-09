import { requestAccess, requireAdmin } from '$server/services/access';
import type { RequestHandler } from './$types';
import { getWidgetLayout, saveWidgetLayout } from '$server/services/dashboardWidgetService';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';
import { widgetLayoutSchema } from '$lib/domain/dashboard';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Dashboard layout GET error:', async () => {
    const layout = await getWidgetLayout();
    return jsonResponse(layout);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Dashboard layout PUT error:', async () => {
    requireAdmin(requestAccess(event));
    const layout = await parseBody(event, widgetLayoutSchema);
    const saved = await saveWidgetLayout(requestAccess(event), layout);
    return jsonResponse(saved);
  });
};
