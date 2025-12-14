import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { AppError, Status } from '$server/exceptions/AppError';
import { serverEnv } from '$lib/config/env.server';
import path from 'path';
import { writeFile } from 'fs/promises';

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

		// Generate unique filename
		const buffer = await file.arrayBuffer();
		const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
		const filePath = path.join(serverEnv?.UPLOADS_DIR || './uploads', filename);

		// Save file to uploads directory
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
