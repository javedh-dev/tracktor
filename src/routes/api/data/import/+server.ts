import { json } from '@sveltejs/kit';
import { importDataSet, resolveImportData } from '$server/services/data-transfer.service';
import { withJsonErrorHandling } from '$server/utils/route-handler';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  return withJsonErrorHandling(
    'Import error:',
    async () => {
      const { data: importData, password } = await request.json();
      const importResult = await resolveImportData(importData, password);

      if (!importResult.success) {
        return json(
          {
            success: false,
            message: importResult.message
          },
          { status: importResult.status }
        );
      }

      await importDataSet(importResult.data);

      return json({
        success: true,
        message: 'Data imported successfully'
      });
    },
    'Failed to import data'
  );
};
