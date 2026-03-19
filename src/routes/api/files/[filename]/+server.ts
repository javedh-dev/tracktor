import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import {
  assertSafeUploadFilename,
  getContentTypeForFilename,
  resolveUploadFilePath
} from '$server/utils/file-route';
import { withRouteErrorHandling } from '$server/utils/route-handler';
import { readFile } from 'fs/promises';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('File download error:', async () => {
    const { filename } = event.params;
    const preview = event.url.searchParams.get('preview') === 'true';

    assertSafeUploadFilename(filename);

    const filePath = resolveUploadFilePath(filename);
    const contentType = getContentTypeForFilename(filename);

    try {
      const fileBuffer = await readFile(filePath);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `${preview ? 'inline' : 'attachment'}; filename="${filename}"`
        }
      });
    } catch (fileErr) {
      console.warn(`File not found: ${filePath}`, fileErr);
      throw error(404, 'File not found');
    }
  });
};
