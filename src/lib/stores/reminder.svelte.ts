import type { Reminder } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';
import { vehicleStore } from './vehicle.svelte';

class ReminderStore {
	reminders = $state<Reminder[]>();
	processing = $state(false);
	error = $state<string>();

	refreshReminders = async () => {
		if (!vehicleStore.selectedId) return;
		this.processing = true;
		try {
			const { data } = await apiClient.get<ApiResponse>(
				`/vehicles/${vehicleStore.selectedId}/reminders`
			);
			const reminders =
				(data.data as Reminder[] | undefined)?.map((reminder) => ({
					...reminder,
					dueDate: new Date(reminder.dueDate)
				})) || [];
			reminders.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
			this.reminders = reminders;
			this.error = undefined;
		} catch (err) {
			this.error = 'Failed to fetch reminders';
		} finally {
			this.processing = false;
		}
	};
}

export const reminderStore = new ReminderStore();
