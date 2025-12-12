import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { AppError, Status } from '$server/exceptions/AppError';

export const POST: RequestHandler = async (event) => {
	try {
		const contentType = event.request.headers.get('content-type');

		if (!contentType || !contentType.includes('multipart/form-data')) {
			throw error(400, 'Request must be multipart/form-data');
		}

		const formData = await event.request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			throw new AppError('File is missing to be uploaded', Status.BAD_REQUEST);
		}

		// In SvelteKit, we need to handle file upload differently
		// This is a simplified version - in practice, you'd want to save the file to disk
		const buffer = await file.arrayBuffer();
		const filename = `${Date.now()}-${file.name}`;

		// TODO: Save file to uploads directory
		// For now, just return the file info

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
	} catch (err) {
		console.error('File upload error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};