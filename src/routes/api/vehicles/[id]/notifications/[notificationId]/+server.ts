import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as notificationService from '$server/services/notificationService';
import { AppError } from '$server/exceptions/AppError';

export const PATCH: RequestHandler = async (event) => {
	try {
		const { notificationId } = event.params;

		if (!notificationId) {
			throw error(400, 'Notification ID is required');
		}

		const result = await notificationService.markNotificationAsRead(notificationId);
		return json(result);
	} catch (err) {
		console.error('Notification PATCH error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
