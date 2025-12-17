import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as reminderService from '$server/services/reminderService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		const result = await reminderService.getReminders(id);
		return json(result);
	} catch (err) {
		console.error('Reminders GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		const body = event.locals.requestBody || (await event.request.json());

		if (!body.dueDate || !body.type || !body.remindSchedule) {
			throw error(400, 'Due date, type, and remind schedule are required');
		}

		const result = await reminderService.addReminder(id, body);
		return json(result, { status: 201 });
	} catch (err) {
		console.error('Reminders POST error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
