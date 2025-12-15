import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { serverEnv } from '$lib/config/env.server';
import path from 'path';
import { readFile } from 'fs/promises';

export const GET: RequestHandler = async (event) => {
	try {
		const { filename } = event.params;
		const preview = event.url.searchParams.get('preview') === 'true';

		if (!filename) {
			throw error(400, 'Filename is required');
		}

		// Validate filename to prevent path traversal attacks
		if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
			throw error(400, 'Invalid filename');
		}

		const filePath = path.join(serverEnv?.UPLOADS_DIR || './uploads', filename);

		// Determine content type based on extension
		const ext = path.extname(filename).toLowerCase();
		let contentType = 'application/octet-stream';

		if (ext === '.pdf') contentType = 'application/pdf';
		else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
		else if (ext === '.png') contentType = 'image/png';
		else if (ext === '.gif') contentType = 'image/gif';
		else if (ext === '.webp') contentType = 'image/webp';
		else if (ext === '.txt') contentType = 'text/plain';

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
	} catch (err) {
		console.error('File download error:', err);

		// Check if this is already a SvelteKit error
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
