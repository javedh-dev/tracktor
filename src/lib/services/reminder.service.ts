import type { Reminder } from '$lib/domain/reminder';
import { createEntityService } from './entity-service';

const { save, delete: remove } = createEntityService<Reminder>({
  basePath: 'reminders',
  serialize: (reminder) => ({
    ...reminder,
    dueDate:
      reminder.dueDate instanceof Date ? reminder.dueDate.toISOString() : (reminder.dueDate ?? null)
  })
});

export const saveReminder = save;
export const deleteReminder = remove;
