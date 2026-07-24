import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDashboardSummary } from '$server/services/dashboardService';

export const GET: RequestHandler = async () => {
  try {
    const summary = await getDashboardSummary();
    return json({ success: true, data: summary });
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    return json({ success: false, error: 'Failed to fetch dashboard summary' }, { status: 500 });
  }
};
