import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as fileController from '$server/controllers/fileController';

export const POST: RequestHandler = async (event) => {
	try {
		const contentType = event.request.headers.get('content-type');

		if (!contentType || !contentType.includes('multipart/form-data')) {
			throw error(400, 'Request must be multipart/form-data');
		}

		const response = await fileController.uploadFile(event);
		const result = await response.json();

		return json(result, { status: response.status });
	} catch (err) {
		console.error('File upload error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
