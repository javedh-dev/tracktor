import type { Reminder } from '$lib/domain';
import { vehicleStore } from './vehicle.svelte';
import { createEntityStore } from './entity-store.svelte';

function parseReminder(raw: unknown): Reminder {
  const r = raw as Reminder & { dueDate: string };
  return { ...r, dueDate: new Date(r.dueDate) };
}

const entityStore = createEntityStore<Reminder>({
  buildPath: () =>
    vehicleStore.selectedId ? `/vehicles/${vehicleStore.selectedId}/reminders` : undefined,
  map: parseReminder,
  sort: (a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
  errorMessage: 'Failed to fetch reminders'
});

export const reminderStore = {
  get reminders() {
    return entityStore.items;
  },
  get processing() {
    return entityStore.processing;
  },
  get error() {
    return entityStore.error;
  },
  refreshReminders: entityStore.refresh,
  clear: entityStore.clear
};
