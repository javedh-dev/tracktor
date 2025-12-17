import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as reminderService from '$server/services/reminderService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { reminderId } = event.params;

		if (!reminderId) {
			throw error(400, 'Reminder ID is required');
		}

		const result = await reminderService.getReminderById(reminderId);
		return json(result);
	} catch (err) {
		console.error('Reminder GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const { id, reminderId } = event.params;

		if (!id || !reminderId) {
			throw error(400, 'Vehicle ID and reminder ID are required');
		}

		const body = event.locals.requestBody || (await event.request.json());

		const result = await reminderService.updateReminder(id, reminderId, body);
		return json(result);
	} catch (err) {
		console.error('Reminder PUT error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const { reminderId } = event.params;

		if (!reminderId) {
			throw error(400, 'Reminder ID is required');
		}

		const result = await reminderService.deleteReminder(reminderId);
		return json(result);
	} catch (err) {
		console.error('Reminder DELETE error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
