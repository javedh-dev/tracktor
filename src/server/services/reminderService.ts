import { AppError, Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import type { ApiResponse } from '$lib/response';
import { performDelete, validateVehicleExists } from '../utils/serviceUtils';
import { eq } from 'drizzle-orm';

const sanitizeNote = (note: unknown) => {
	if (typeof note === 'string') {
		const trimmed = note.trim();
		return trimmed.length ? trimmed : null;
	}
	return null;
};

const normalizeReminderPayload = (data: any, fallback?: any) => {
	const merged = { ...fallback, ...data };
	const { type, remindSchedule, dueDate } = merged;
	if (!type) {
		throw new AppError('Reminder type is required', Status.BAD_REQUEST);
	}
	if (!remindSchedule) {
		throw new AppError('Reminder schedule is required', Status.BAD_REQUEST);
	}
	if (!dueDate) {
		throw new AppError('Reminder due date is required', Status.BAD_REQUEST);
	}
	const parsedDate = new Date(dueDate);
	if (Number.isNaN(parsedDate.getTime())) {
		throw new AppError('Invalid due date supplied', Status.BAD_REQUEST);
	}

	return {
		type,
		dueDate: parsedDate.toISOString(),
		remindSchedule,
		note: sanitizeNote(merged.note),
		isCompleted: Boolean(merged.isCompleted)
	};
};

export const addReminder = async (vehicleId: string, reminderData: any): Promise<ApiResponse> => {
	await validateVehicleExists(vehicleId);
	const payload = normalizeReminderPayload(reminderData);
	const inserted = await db
		.insert(schema.reminderTable)
		.values({
			...payload,
			vehicleId,
			id: undefined
		})
		.returning();

	return {
		data: inserted[0],
		success: true,
		message: 'Reminder created successfully.'
	};
};

export const getReminders = async (vehicleId: string): Promise<ApiResponse> => {
	const reminders = await db.query.reminderTable.findMany({
		where: (reminder, { eq }) => eq(reminder.vehicleId, vehicleId),
		orderBy: (reminder, { asc }) => [asc(reminder.dueDate)]
	});

	return {
		data: reminders,
		success: true
	};
};

export const getReminderById = async (id: string): Promise<ApiResponse> => {
	const reminder = await db.query.reminderTable.findFirst({
		where: (reminder, { eq }) => eq(reminder.id, id)
	});

	if (!reminder) {
		throw new AppError(`No reminder found for id : ${id}`, Status.NOT_FOUND);
	}

	return {
		data: reminder,
		success: true
	};
};

export const updateReminder = async (
	vehicleId: string,
	id: string,
	reminderData: any
): Promise<ApiResponse> => {
	const reminder = await db.query.reminderTable.findFirst({
		where: (reminder, { eq, and }) => and(eq(reminder.vehicleId, vehicleId), eq(reminder.id, id))
	});

	if (!reminder) {
		throw new AppError(`No reminder found for id : ${id}`, Status.NOT_FOUND);
	}

	const payload = normalizeReminderPayload(reminderData, reminder);
	const [updated] = await db
		.update(schema.reminderTable)
		.set({ ...payload })
		.where(eq(schema.reminderTable.id, id))
		.returning();

	return {
		data: updated,
		success: true,
		message: 'Reminder updated successfully.'
	};
};

export const deleteReminder = async (id: string): Promise<ApiResponse> => {
	return performDelete(schema.reminderTable, id, 'Reminder');
};
