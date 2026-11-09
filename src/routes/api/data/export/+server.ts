import { requestAccess, requireAdmin } from '$server/services/access';
import { json } from '@sveltejs/kit';
import { buildExportData } from '$server/services/data-transfer.service';
import { withRouteErrorHandling } from '$server/utils/route-handler';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const { request } = event;
  return withRouteErrorHandling('Export error:', async () => {
    requireAdmin(requestAccess(event));
    const { encrypt: shouldEncrypt, password } = await request.json();
    const finalData = await buildExportData(requestAccess(event), shouldEncrypt, password);

    return json({
      success: true,
      data: finalData
    });
  });
};
