import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import * as fileController from '$server/controllers/fileController';

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

		const response = await fileController.downloadFile(event);

		// If the controller returns a JSON error response, parse and handle it
		if (response.headers.get('content-type')?.includes('application/json')) {
			const result = await response.json();
			if (!result.success) {
				throw error(404, result.message || 'File not found');
			}
		}

		// Return the file response directly
		return response;
	} catch (err) {
		console.error('File download error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
