import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { AppError, Status } from '$server/exceptions/AppError';
import { resolveUploadFilePath, sanitizeUploadFilename } from '$server/utils/file-route';
import { withRouteErrorHandling } from '$server/utils/route-handler';
import { writeFile } from 'fs/promises';

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('File upload error:', async () => {
    const contentType = event.request.headers.get('content-type');

    if (!contentType || !contentType.includes('multipart/form-data')) {
      throw error(400, 'Request must be multipart/form-data');
    }

    const formData = await event.request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new AppError('File is missing to be uploaded', Status.BAD_REQUEST);
    }

    const buffer = await file.arrayBuffer();
    const filename = sanitizeUploadFilename(file.name);
    const filePath = resolveUploadFilePath(filename);

    try {
      await writeFile(filePath, Buffer.from(buffer));
    } catch (writeErr) {
      console.error('Failed to save file:', writeErr);
      throw new AppError('Failed to save file', Status.INTERNAL_SERVER_ERROR);
    }

    const result = {
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: filename,
        originalName: file.name,
        size: file.size,
        mimetype: file.type
      }
    };

    return json(result);
  });
};
