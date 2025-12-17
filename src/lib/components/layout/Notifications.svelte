<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Shield from '@lucide/svelte/icons/shield';
	import BadgeInfo from '@lucide/svelte/icons/badge-info';

	import { browser } from '$app/environment';
	import { REMINDER_TYPES } from '$lib/domain/reminder';
	import type { Reminder } from '$lib/domain';
	import { reminderStore } from '$stores/reminder.svelte';
	import { insuranceStore } from '$stores/insurance.svelte';
	import { puccStore } from '$stores/pucc.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { differenceInDays, format } from 'date-fns';
	import { calculateVehicleAlerts, type VehicleAlert } from '$lib/helper/alert.helper';
	import { saveReminder } from '$lib/services/reminder.service';
	import { toast } from 'svelte-sonner';
	import { formatDate } from '$lib/helper/format.helper';
	import { authStore } from '$lib/stores/auth.svelte';
	import * as DropdownMenu from '../ui/dropdown-menu';
	import Button from '../ui/button/button.svelte';

	type ReminderSeverity = 'critical' | 'warning' | 'info';

	type ReminderNotification = Reminder & {
		dueDate: Date;
		daysRemaining: number;
		severity: ReminderSeverity;
	};

	const REMINDER_LOOKAHEAD_DAYS = 30;
	const REMINDER_PAST_WINDOW_DAYS = 30;
	const REMINDER_URGENT_DAYS = 7;

	const reminderSeverityLabel: Record<ReminderSeverity, string> = {
		critical: 'Overdue',
		warning: 'Due Soon',
		info: 'Upcoming'
	};

	const reminderSeverityBadge: Record<ReminderSeverity, string> = {
		critical: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
		warning: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
		info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
	};

	const reminderSeverityRing: Record<ReminderSeverity, string> = {
		critical:
			'border-red-500/40 bg-red-500/10 text-red-500 dark:border-red-500/50 dark:bg-red-500/10',
		warning:
			'border-orange-500/40 bg-orange-500/10 text-orange-500 dark:border-orange-500/50 dark:bg-orange-500/10',
		info: 'border-blue-500/40 bg-blue-500/10 text-blue-500 dark:border-blue-500/50 dark:bg-blue-500/10'
	};

	const alertStatusLabel: Record<VehicleAlert['status'], string> = {
		expired: 'Expired',
		expiring: 'Expiring',
		valid: 'Healthy',
		missing: 'Missing'
	};

	const alertStatusBadge: Record<VehicleAlert['status'], string> = {
		expired: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
		expiring: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
		valid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
		missing: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
	};

	const alertStatusRing: Record<VehicleAlert['status'], string> = {
		expired:
			'border-red-500/40 bg-red-500/10 text-red-500 dark:border-red-500/50 dark:bg-red-500/15',
		expiring:
			'border-orange-500/40 bg-orange-500/10 text-orange-500 dark:border-orange-500/50 dark:bg-orange-500/15',
		valid:
			'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-500/15',
		missing:
			'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:border-amber-400/50 dark:bg-amber-500/15'
	};

	const describeReminderTiming = (daysRemaining: number) => {
		if (daysRemaining < 0) {
			const overdue = Math.abs(daysRemaining);
			return `${overdue} day${overdue === 1 ? '' : 's'} overdue`;
		}
		if (daysRemaining === 0) return 'Due today';
		if (daysRemaining === 1) return 'Due tomorrow';
		return `Due in ${daysRemaining} days`;
	};

	const buildReminderPayload = (
		reminder: ReminderNotification,
		isCompleted: boolean
	): Reminder => ({
		id: reminder.id,
		vehicleId: reminder.vehicleId,
		type: reminder.type,
		dueDate: reminder.dueDate,
		remindSchedule: reminder.remindSchedule,
		note: reminder.note,
		isCompleted
	});

	let completingReminderIds: Record<string, boolean> = {};

	const setReminderLoading = (id: string, state: boolean) => {
		if (state) {
			completingReminderIds = { ...completingReminderIds, [id]: true };
			return;
		}
		const { [id]: _removed, ...rest } = completingReminderIds;
		completingReminderIds = rest;
	};

	const isReminderCompleting = (id?: string | null) =>
		id ? Boolean(completingReminderIds[id]) : false;

	const markReminderComplete = async (reminder: ReminderNotification) => {
		if (!reminder.id) {
			toast.error('Unable to update reminder without an id.');
			return;
		}
		if (isReminderCompleting(reminder.id)) return;
		setReminderLoading(reminder.id, true);
		try {
			const response = await saveReminder(buildReminderPayload(reminder, true));
			if (response.status !== 'OK') {
				throw new Error(response.error || 'Failed to update reminder.');
			}
			toast.success('Reminder marked as done.');
			await reminderStore.refreshReminders();
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update reminder.';
			toast.error(message);
		} finally {
			setReminderLoading(reminder.id, false);
		}
	};

	const reminderNotifications = $derived<ReminderNotification[]>(
		(() => {
			if (!vehicleStore.selectedId || !reminderStore.reminders) return [];
			const now = new Date();
			return reminderStore.reminders
				.filter((reminder) => !reminder.isCompleted)
				.map((reminder) => {
					const dueDate =
						reminder.dueDate instanceof Date ? reminder.dueDate : new Date(reminder.dueDate);
					const daysRemaining = differenceInDays(dueDate, now);
					const severity: ReminderSeverity =
						daysRemaining < 0
							? 'critical'
							: daysRemaining <= REMINDER_URGENT_DAYS
								? 'warning'
								: 'info';
					return {
						...reminder,
						dueDate,
						daysRemaining,
						severity
					};
				})
				.filter(
					(reminder) =>
						reminder.daysRemaining <= REMINDER_LOOKAHEAD_DAYS &&
						reminder.daysRemaining >= -REMINDER_PAST_WINDOW_DAYS
				)
				.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
				.slice(0, 5);
		})()
	);

	const alertNotifications = $derived<VehicleAlert[]>(
		vehicleStore.selectedId
			? calculateVehicleAlerts(insuranceStore.insurances, puccStore.pollutionCerts).filter(
					(alert) =>
						alert.status === 'expired' || alert.status === 'expiring' || alert.status === 'missing'
				)
			: []
	);

	const notificationCount = $derived(
		reminderNotifications.length +
			alertNotifications.filter((alert) => alert.status !== 'valid').length
	);

	const notificationLoading = $derived(
		reminderStore.processing || insuranceStore.processing || puccStore.processing
	);

	let hydratedVehicleId: string | undefined;

	$effect(() => {
		if (!browser || !authStore.isLoggedIn) return;
		const selectedId = vehicleStore.selectedId;
		if (!selectedId) {
			hydratedVehicleId = undefined;
			reminderStore.refreshReminders();
			insuranceStore.refreshInsurances();
			puccStore.refreshPuccs();
			return;
		}
		if (hydratedVehicleId === selectedId) return;
		hydratedVehicleId = selectedId;
		reminderStore.refreshReminders();
		insuranceStore.refreshInsurances();
		puccStore.refreshPuccs();
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground relative inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		aria-label="Notifications"
		title="Notifications"
	>
		<Bell class="h-[1.15rem] w-[1.15rem]" />
		{#if notificationCount > 0}
			<span
				class="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.65rem] leading-none font-semibold"
			>
				{notificationCount > 9 ? '9+' : notificationCount}
			</span>
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-88 space-y-2">
		<div class="flex items-center justify-between px-2 py-1.5">
			<span class="text-sm font-semibold">Notifications</span>
			{#if notificationCount > 0}
				<span class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
					{notificationCount} new
				</span>
			{/if}
		</div>
		<DropdownMenu.Separator />
		{#if !vehicleStore.selectedId}
			<div class="text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm">
				<AlertTriangle class="h-4 w-4" />
				<span>Select a vehicle to load reminders and alerts.</span>
			</div>
		{:else if notificationLoading}
			<div class="text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm">
				<Loader2 class="h-4 w-4 animate-spin" />
				<span>Syncing latest data...</span>
			</div>
		{:else if notificationCount === 0}
			<div class="text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm">
				<CheckCircle2 class="h-4 w-4" />
				<span>You're all caught up.</span>
			</div>
		{:else}
			<div class="max-h-80 space-y-3 overflow-auto px-1 py-2">
				{#if reminderNotifications.length}
					<p class="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
						Reminders
					</p>
					<ul class="space-y-2">
						{#each reminderNotifications as reminder (reminder.id ?? `${reminder.vehicleId}-${reminder.dueDate.getTime()}`)}
							<li
								class="border-border/50 bg-background/90 flex items-start gap-3 rounded-md border px-3 py-2 shadow-sm"
							>
								<div class="rounded-full border p-1 {reminderSeverityRing[reminder.severity]}">
									<CalendarDays class="h-4 w-4" />
								</div>
								<div class="flex-1">
									<div class="flex items-center justify-between gap-2">
										<p class="text-sm font-semibold">
											{REMINDER_TYPES[reminder.type]}
										</p>
										<div class="flex items-center gap-2">
											<span
												class="rounded-full px-2 py-0.5 text-xs font-semibold {reminderSeverityBadge[
													reminder.severity
												]}"
											>
												{reminderSeverityLabel[reminder.severity]}
											</span>
											<Button
												variant="ghost"
												size="sm"
												title="Mark reminder as done"
												aria-label={`Mark ${REMINDER_TYPES[reminder.type]} reminder as done`}
												onclick={() => markReminderComplete(reminder)}
												disabled={!reminder.id || isReminderCompleting(reminder.id)}
											>
												{#if isReminderCompleting(reminder.id)}
													<Loader2 class="h-3.5 w-3.5 animate-spin" />
												{:else}
													<CheckCircle2 class="h-3.5 w-3.5" />
												{/if}
											</Button>
										</div>
									</div>
									<p class="text-muted-foreground text-xs">
										{formatDate(reminder.dueDate)} · {describeReminderTiming(
											reminder.daysRemaining
										)}
									</p>
									{#if reminder.note}
										<p class="text-muted-foreground mt-1 text-xs">
											{reminder.note}
										</p>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
				{#if alertNotifications.length}
					<p class="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
						Compliance Alerts
					</p>
					<ul class="space-y-2">
						{#each alertNotifications as alert (alert.type)}
							<li
								class="border-border/50 bg-background/90 flex items-start gap-3 rounded-md border px-3 py-2 shadow-sm"
							>
								<div class="rounded-full border p-1 {alertStatusRing[alert.status]}">
									{#if alert.type === 'insurance'}
										<Shield class="h-4 w-4" />
									{:else}
										<BadgeInfo class="h-4 w-4" />
									{/if}
								</div>
								<div class="flex-1">
									<div class="flex items-center justify-between gap-2">
										<p class="text-sm font-semibold">{alert.title}</p>
										<span
											class="rounded-full px-2 py-0.5 text-xs font-semibold {alertStatusBadge[
												alert.status
											]}"
										>
											{alertStatusLabel[alert.status]}
										</span>
									</div>
									{#if alert.status === 'missing'}
										<p class="text-muted-foreground text-xs">{alert.message}</p>
									{:else}
										<p class="text-muted-foreground text-xs">
											Expires
											{#if alert.expiryDate}
												{` ${format(alert.expiryDate, 'MMM dd, yyyy')}`}
											{:else}
												—
											{/if}
										</p>
										<p class="text-muted-foreground text-xs">{alert.message}</p>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
