<script lang="ts">
	import Button from '$ui/button/button.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import IconButton from '$appui/IconButton.svelte';
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import ReminderForm from './ReminderForm.svelte';
	import Badge from '$ui/badge/badge.svelte';
	import { sheetStore } from '$stores/sheet.svelte';
	import { reminderStore } from '$stores/reminder.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { REMINDER_TYPES, REMINDER_SCHEDULES } from '$lib/domain/reminder';
	import { formatDate } from '$lib/helper/format.helper';
	import { saveReminder, deleteReminder } from '$lib/services/reminder.service';
	import { toast } from 'svelte-sonner';
	import BellPlus from '@lucide/svelte/icons/bell-plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Circle from '@lucide/svelte/icons/circle';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import { browser } from '$app/environment';
	import type { Reminder } from '$lib/domain';

	let deleteDialog = $state(false);
	let reminderToDelete = $state<Reminder>();
	let lastVehicleId: string | undefined;

	const isOverdue = (reminder: Reminder) => {
		return !reminder.isCompleted && reminder.dueDate.getTime() < Date.now();
	};

	const reminderKey = (reminder: Reminder) =>
		reminder.id ?? `${reminder.vehicleId}-${reminder.dueDate.getTime()}`;

	$effect(() => {
		if (!browser) return;
		const vehicleId = vehicleStore.selectedId;
		if (!vehicleId) {
			lastVehicleId = undefined;
			reminderStore.reminders = undefined;
			return;
		}
		if (vehicleId !== lastVehicleId) {
			lastVehicleId = vehicleId;
			reminderStore.refreshReminders();
		}
	});

	const openReminderModal = () => {
		if (!vehicleStore.selectedId) return;
		sheetStore.openSheet(
			ReminderForm,
			'Add Reminder',
			'Set up reminders for renewals and maintenance.',
			{ vehicleId: vehicleStore.selectedId }
		);
	};

	const editReminder = (reminder: Reminder) => {
		sheetStore.openSheet(ReminderForm, 'Update Reminder', '', reminder);
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

	const requestDelete = (reminder: Reminder) => {
		reminderToDelete = reminder;
		deleteDialog = true;
	};

	const handleDelete = async () => {
		if (!reminderToDelete) return;
		const res = await deleteReminder(reminderToDelete);
		if (res.status === 'OK') {
			toast.success('Reminder deleted.');
			reminderStore.refreshReminders();
			reminderToDelete = undefined;
			deleteDialog = false;
		} else {
			toast.error(res.error || 'Failed to delete reminder.');
		}
	};

	const reminders = $derived(reminderStore.reminders || []);
</script>

<section class="mt-8 space-y-4">
	<div class="flex flex-wrap items-start justify-between gap-2">
		<div>
			<h2 class="text-xl font-semibold">Reminders</h2>
			<p class="text-muted-foreground text-sm">Track important renewals and service dates.</p>
		</div>
		<Button
			variant="secondary"
			size="sm"
			disabled={!vehicleStore.selectedId}
			class="cursor-pointer"
			onclick={openReminderModal}
		>
			<LabelWithIcon icon={BellPlus} label="New Reminder" />
		</Button>
	</div>

	{#if !vehicleStore.selectedId}
		<div
			class="bg-muted text-muted-foreground border-border flex flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center"
		>
			<p class="text-base font-semibold">Select a vehicle to view reminders.</p>
			<p class="text-sm">Pick a vehicle above to load its upcoming reminders.</p>
		</div>
	{:else if reminderStore.processing}
		<div class="space-y-3">
			<Skeleton class="h-28 w-full rounded-2xl" />
			<Skeleton class="h-28 w-full rounded-2xl" />
		</div>
	{:else if reminderStore.error}
		<LabelWithIcon
			icon={CircleAlert}
			iconClass="h-5 w-5"
			style="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive"
			label={reminderStore.error}
		/>
	{:else if reminders.length > 0}
		<div class="space-y-3">
			{#each reminders as reminder (reminderKey(reminder))}
				<article class="bg-card border-border rounded-2xl border p-4 shadow-sm">
					<div class="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
								{REMINDER_TYPES[reminder.type]}
							</p>
							<p class={`text-2xl font-semibold ${isOverdue(reminder) ? 'text-destructive' : ''}`}>
								{formatDate(reminder.dueDate)}
							</p>
							<p class="text-muted-foreground text-xs">
								{REMINDER_SCHEDULES[reminder.remindSchedule]}
							</p>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<Badge variant={reminder.isCompleted ? 'secondary' : 'outline'}>
								{reminder.isCompleted ? 'Completed' : 'Pending'}
							</Badge>
							{#if isOverdue(reminder)}
								<Badge variant="destructive">Overdue</Badge>
							{/if}
						</div>
					</div>

					{#if reminder.note}
						<p class="text-muted-foreground mt-2 text-sm">{reminder.note}</p>
					{/if}

					<div class="mt-4 flex flex-wrap items-center justify-between gap-2">
						<button
							type="button"
							onclick={() => toggleCompletion(reminder)}
							class="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
						>
							{#if reminder.isCompleted}
								<CheckCircle2 class="h-4 w-4 text-emerald-500" />
								<span>Mark as pending</span>
							{:else}
								<Circle class="h-4 w-4" />
								<span>Mark as done</span>
							{/if}
						</button>
						<div class="flex items-center gap-2">
							<IconButton
								buttonStyles="hover:bg-slate-200 dark:hover:bg-slate-700"
								iconStyles="text-slate-600 hover:text-sky-500 dark:text-slate-200"
								icon={Pencil}
								onclick={() => editReminder(reminder)}
								ariaLabel="Edit reminder"
							/>
							<IconButton
								buttonStyles="hover:bg-red-100 dark:hover:bg-red-700"
								iconStyles="text-red-500 hover:text-red-600 dark:text-red-200"
								icon={Trash2}
								onclick={() => requestDelete(reminder)}
								ariaLabel="Delete reminder"
							/>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{:else}
		<LabelWithIcon
			icon={CircleSlash2}
			iconClass="h-5 w-5"
			style="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center"
			label="No reminders yet. Create one to stay ahead of upcoming renewals."
		/>
	{/if}
</section>

<DeleteConfirmation onConfirm={handleDelete} bind:open={deleteDialog} />
