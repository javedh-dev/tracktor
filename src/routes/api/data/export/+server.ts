import { json } from '@sveltejs/kit';
import { buildExportData } from '$server/services/data-transfer.service';
import { withRouteErrorHandling } from '$server/utils/route-handler';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  return withRouteErrorHandling('Export error:', async () => {
    const { encrypt: shouldEncrypt, password } = await request.json();
    const finalData = await buildExportData(shouldEncrypt, password);

    return json({
      success: true,
      data: finalData
    });
  });
};
