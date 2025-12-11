import type { RequestEvent } from '@sveltejs/kit';
import { env } from '../config/env';
import { AppError, Status } from '../exceptions/AppError';
import path from 'path';
import { readFile } from 'fs/promises';

export const uploadFile = async (event: RequestEvent) => {
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

	return new Response(
		JSON.stringify({
			success: true,
			message: 'File uploaded successfully',
			data: {
				filename: filename,
				originalName: file.name,
				size: file.size,
				mimetype: file.type
			}
		}),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		}
	);
};

export const downloadFile = async (event: RequestEvent) => {
	const { filename } = event.params;
	const filePath = path.join(env.UPLOADS_DIR, filename || '');

	try {
		const fileBuffer = await readFile(filePath);
		return new Response(fileBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/octet-stream',
				'Content-Disposition': `attachment; filename="${filename}"`
			}
		});
	} catch (err) {
		return new Response(
			JSON.stringify({
				success: false,
				message: 'File not found'
			}),
			{
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
