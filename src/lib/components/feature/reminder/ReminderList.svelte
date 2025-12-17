<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import Badge from '$ui/badge/badge.svelte';
	import { reminderStore } from '$stores/reminder.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { REMINDER_TYPES, REMINDER_SCHEDULES } from '$lib/domain/reminder';
	import { formatDate } from '$lib/helper/format.helper';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import BellRing from '@lucide/svelte/icons/bell-ring';
	import Calendar from '@lucide/svelte/icons/calendar';
	import AlarmClock from '@lucide/svelte/icons/alarm-clock';
	import { browser } from '$app/environment';
	import type { Reminder } from '$lib/domain';
	import FileText from '@lucide/svelte/icons/file-text';
	import ReminderContextMenu from './ReminderContextMenu.svelte';

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
	const reminders = $derived(reminderStore.reminders || []);
</script>

{#if !vehicleStore.selectedId}
	<div
		class="bg-muted text-muted-foreground border-border flex flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center"
	>
		<p class="text-base font-semibold">Select a vehicle to view reminders.</p>
		<p class="text-sm">Pick a vehicle above to load its upcoming reminders.</p>
	</div>
{:else if reminderStore.processing}
	<div class="space-y-4 pt-4">
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
	{#each reminders as reminder (reminderKey(reminder))}
		<div class="bg-background/50 mt-4 rounded-lg border p-4 shadow-sm lg:p-6">
			<div class="flex items-center justify-between">
				<div class="flex flex-wrap items-center gap-4 align-middle">
					<div class="flex items-center gap-3 text-indigo-500 dark:text-indigo-400">
						<BellRing class="h-6 w-6" />
						<span class="line-clamp-1 text-lg font-bold lg:text-xl">
							{REMINDER_TYPES[reminder.type]}
						</span>
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
				<ReminderContextMenu
					{reminder}
					onaction={() => {
						reminderStore.refreshReminders();
					}}
				/>
			</div>

			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
					<Calendar class="h-5 w-5" />
					<span class="font-semibold">Due Date:</span>
					<span>{formatDate(reminder.dueDate)}</span>
				</div>
				<div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
					<AlarmClock class="h-5 w-5" />
					<span class="font-semibold">Reminder schedule:</span>
					<span>{REMINDER_SCHEDULES[reminder.remindSchedule]}</span>
				</div>
				{#if reminder.note}
					<div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
						<FileText class="h-5 w-5" />
						<span class="font-semibold">Notes:</span>
						<span>{reminder.note}</span>
					</div>
				{/if}
			</div>
		</div>
	{/each}
{:else}
	<LabelWithIcon
		icon={CircleSlash2}
		iconClass="h-5 w-5"
		style="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center"
		label="No reminders yet. Create one to stay ahead of upcoming renewals."
	/>
{/if}
