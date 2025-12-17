import type { Reminder, Response } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';

const serializeReminder = (reminder: Reminder) => ({
	...reminder,
	dueDate:
		reminder.dueDate instanceof Date ? reminder.dueDate.toISOString() : (reminder.dueDate ?? null)
});

export const saveReminder = async (reminder: Reminder): Promise<Response<Reminder>> => {
	const res: Response<Reminder> = { status: 'OK' };
	try {
		const method = reminder.id ? 'PUT' : 'POST';
		const url = `/vehicles/${reminder.vehicleId}/reminders/${reminder.id || ''}`;
		const response = await apiClient[method.toLowerCase() as 'post' | 'put'](
			url,
			serializeReminder(reminder)
		);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to save reminder.';
	}
	return res;
};

export const deleteReminder = async (reminder: Reminder): Promise<Response<string>> => {
	if (!reminder.id) {
		return {
			status: 'ERROR',
			error: 'Reminder id is required to delete.'
		};
	}

	const res: Response<string> = { status: 'OK' };
	try {
		const response = await apiClient.delete(
			`/vehicles/${reminder.vehicleId}/reminders/${reminder.id}`
		);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to delete reminder.';
	}
	return res;
};
