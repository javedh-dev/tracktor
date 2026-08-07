import { json } from '@sveltejs/kit';
import { importDataSet, resolveImportData } from '$server/services/data-transfer.service';
import { withRouteErrorHandling } from '$server/utils/route-handler';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  return withRouteErrorHandling('Import error:', async () => {
    const { data: importData, password } = await request.json();
    const resolvedData = await resolveImportData(importData, password);

    await importDataSet(resolvedData);

    return json({
      success: true,
      message: 'Data imported successfully'
    });
  });
};
