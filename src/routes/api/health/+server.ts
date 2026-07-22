import type { RequestHandler } from './$types';
import { jsonResponse } from '$server/utils/route-handler';

export const GET: RequestHandler = async () => {
  return jsonResponse({ timestamp: new Date().toISOString() }, 'Tracktor API is working');
};
