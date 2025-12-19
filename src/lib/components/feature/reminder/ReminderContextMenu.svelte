<script lang="ts">
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import Button from '$ui/button/button.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import {
		deleteReminder as deleteReminderService,
		saveReminder
	} from '$lib/services/reminder.service';
	import type { Reminder } from '$lib/domain';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import { toast } from 'svelte-sonner';
	import { sheetStore } from '$stores/sheet.svelte';
	import ReminderForm from './ReminderForm.svelte';
	import { reminderStore } from '$lib/stores/reminder.svelte';

	let { reminder, onaction }: { reminder: Reminder; onaction: () => void } = $props();
	let showDeleteDialog = $state(false);

	const deleteReminder = () => {
		deleteReminderService(reminder).then((res) => {
			if (res.status === 'OK') {
				showDeleteDialog = false;
				toast.success('Deleted reminder...!!!');
				onaction();
			} else {
				toast.error(res.error || 'Some error occurred while deleting PUCC.');
			}
		});
	};
	const toggleCompletion = async (reminder: Reminder) => {
		const updated = { ...reminder, isCompleted: !reminder.isCompleted };
		const res = await saveReminder(updated);
		if (res.status === 'OK') {
			toast.success(`Reminder marked ${updated.isCompleted ? 'complete' : 'pending'}.`);
			reminderStore.refreshReminders();
		} else {
			toast.error(res.error || 'Unable to update reminder status.');
		}
	};
</script>

<div id="reminder-context-menu" class="reminder-context-menu flex flex-row justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			id="reminder-menu-trigger"
			class="data-[state=open]:bg-muted text-muted-foreground flex size-8"
		>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<EllipsisVertical />
					<span class="sr-only">Open menu</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content id="reminder-menu-content" align="end" class="w-32">
			<DropdownMenu.Item id="reminder-menu-toggle" onclick={() => toggleCompletion(reminder)}>
				{reminder.isCompleted ? 'Mark as pending' : 'Mark as done'}
			</DropdownMenu.Item>
			<DropdownMenu.Item
				id="reminder-menu-edit"
				onclick={() => {
					sheetStore.openSheet(ReminderForm, 'Update Reminder', '', reminder);
				}}
			>
				Edit
			</DropdownMenu.Item>
			<DropdownMenu.Item
				id="reminder-menu-delete"
				variant="destructive"
				onclick={() => (showDeleteDialog = true)}
			>
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<DeleteConfirmation onConfirm={() => deleteReminder()} bind:open={showDeleteDialog} />
