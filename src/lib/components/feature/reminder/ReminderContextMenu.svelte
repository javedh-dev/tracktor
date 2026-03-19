<script lang="ts">
  import CrudActionsMenu from '$appui/CrudActionsMenu.svelte';
  import {
    deleteReminder as deleteReminderService,
    saveReminder
  } from '$lib/services/reminder.service';
  import type { Reminder } from '$lib/domain';
  import { toast } from 'svelte-sonner';
  import { sheetStore } from '$stores/sheet.svelte';
  import ReminderForm from './ReminderForm.svelte';
  import { reminderStore } from '$lib/stores/reminder.svelte';
  import * as m from '$lib/paraglide/messages';

  let { reminder, onaction }: { reminder: Reminder; onaction: () => void } = $props();

  const deleteReminder = (closeDialog: () => void) => {
    deleteReminderService(reminder).then((res) => {
      if (res.status === 'OK') {
        closeDialog();
        toast.success(m.reminder_delete_success());
        onaction();
      } else {
        toast.error(res.error || m.reminder_delete_error());
      }
    });
  };
  const toggleCompletion = async (reminder: Reminder) => {
    const updated = { ...reminder, isCompleted: !reminder.isCompleted };
    const res = await saveReminder(updated);
    if (res.status === 'OK') {
      toast.success(m.reminder_status_completed());
      reminderStore.refreshReminders();
    } else {
      toast.error(res.error || m.reminder_status_error());
    }
  };
</script>

<CrudActionsMenu
  menuId="reminder-context-menu"
  triggerId="reminder-menu-trigger"
  contentId="reminder-menu-content"
  editItemId="reminder-menu-edit"
  deleteItemId="reminder-menu-delete"
  openLabel={m.reminder_menu_open()}
  editLabel={m.reminder_menu_edit()}
  deleteLabel={m.reminder_menu_delete()}
  extraItems={[
    {
      id: 'reminder-menu-toggle',
      label: reminder.isCompleted
        ? m.reminder_menu_toggle_done_done()
        : m.reminder_menu_toggle_done_pending(),
      onclick: () => toggleCompletion(reminder)
    }
  ]}
  onEdit={() => sheetStore.openSheet(ReminderForm, m.reminder_menu_sheet_title(), '', reminder)}
  onDelete={deleteReminder}
/>
