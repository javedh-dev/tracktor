import { requestAccess, requireAdmin } from '$server/services/access';
import { json } from '@sveltejs/kit';
import { importDataSet, resolveImportData } from '$server/services/data-transfer.service';
import { withRouteErrorHandling } from '$server/utils/route-handler';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const { request } = event;
  return withRouteErrorHandling('Import error:', async () => {
    requireAdmin(requestAccess(event));
    const { data: importData, password } = await request.json();
    const resolvedData = await resolveImportData(importData, password);

    await importDataSet(requestAccess(event), resolvedData);

    return json({
      success: true,
      message: 'Data imported successfully'
    });
  });
};
