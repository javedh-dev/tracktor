import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { serverEnv } from '$lib/config/env';
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

		const filePath = path.join(serverEnv?.UPLOADS_DIR || './uploads', filename);

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