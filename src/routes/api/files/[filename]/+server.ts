import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$server/config/env';
import path from 'path';
import { readFile } from 'fs/promises';

export const GET: RequestHandler = async (event) => {
	try {
		const { filename } = event.params;

		if (!filename) {
			throw error(400, 'Filename is required');
		}

		// Validate filename to prevent path traversal attacks
		if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
			throw error(400, 'Invalid filename');
		}

		const filePath = path.join(env.UPLOADS_DIR, filename);

		try {
			const fileBuffer = await readFile(filePath);
			return new Response(fileBuffer, {
				status: 200,
				headers: {
					'Content-Type': 'application/octet-stream',
					'Content-Disposition': `attachment; filename="${filename}"`
				}
			});
		} catch (fileErr) {
			throw error(404, 'File not found');
		}
	} catch (err) {
		console.error('File download error:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};