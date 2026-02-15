<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Shield from '@lucide/svelte/icons/shield';
	import BadgeInfo from '@lucide/svelte/icons/badge-info';
	import Check from '@lucide/svelte/icons/check';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Leaf from '@lucide/svelte/icons/leaf';
	import FileText from '@lucide/svelte/icons/file-text';
	import X from '@lucide/svelte/icons/x';

	import { browser } from '$app/environment';
	import { REMINDER_TYPES } from '$lib/domain/reminder';
	import type { Reminder } from '$lib/domain';
	import type { Notification } from '$lib/domain/notification';
	import { reminderStore } from '$stores/reminder.svelte';
	import { insuranceStore } from '$stores/insurance.svelte';
	import { puccStore } from '$stores/pucc.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { differenceInDays, format } from 'date-fns';
	import { getNextDueDate } from '$lib/helper/recurrence.helper';
	import { calculateVehicleAlerts, type VehicleAlert } from '$lib/helper/alert.helper';
	import { saveReminder } from '$lib/services/reminder.service';
	import { getNotifications, markAllNotificationsAsRead } from '$services/notification.service';
	import { toast } from 'svelte-sonner';
	import { formatDate } from '$lib/helper/format.helper';
	import { authStore } from '$lib/stores/auth.svelte';
	import * as DropdownMenu from '../ui/dropdown-menu';
	import Button from '../ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages/_index.js';

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
		critical: m.notifications_severity_overdue(),
		warning: m.notifications_severity_due_soon(),
		info: m.notifications_severity_upcoming()
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
		expired: m.alerts_status_expired(),
		expiring: m.alerts_status_expiring(),
		valid: m.alerts_status_valid(),
		missing: m.alerts_status_missing()
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

	type NotificationType = Notification['type'];

	const notificationTypeStyles: Record<
		NotificationType,
		{ ring: string; badge: string; icon: any }
	> = {
		reminder: {
			ring: 'border-blue-500/40 bg-blue-500/10 text-blue-500 dark:border-blue-500/50 dark:bg-blue-500/10',
			badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
			icon: CalendarDays
		},
		maintenance: {
			ring: 'border-violet-500/40 bg-violet-500/10 text-violet-500 dark:border-violet-500/50 dark:bg-violet-500/10',
			badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
			icon: Wrench
		},
		insurance: {
			ring: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-500/10',
			badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
			icon: Shield
		},
		pollution: {
			ring: 'border-green-500/40 bg-green-500/10 text-green-600 dark:border-green-500/50 dark:bg-green-500/10',
			badge: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300',
			icon: Leaf
		},
		registration: {
			ring: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:border-amber-500/50 dark:bg-amber-500/10',
			badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
			icon: FileText
		},
		alert: {
			ring: 'border-red-500/40 bg-red-500/10 text-red-500 dark:border-red-500/50 dark:bg-red-500/10',
			badge: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
			icon: AlertTriangle
		}
	};

	const describeReminderTiming = (daysRemaining: number) => {
		if (daysRemaining < 0) {
			const overdue = Math.abs(daysRemaining);
			return m.notifications_overdue_days({ days: overdue, plural: overdue === 1 ? '' : 's' });
		}
		if (daysRemaining === 0) return m.notifications_due_today();
		if (daysRemaining === 1) return m.notifications_due_tomorrow();
		return m.notifications_due_in_days({ days: daysRemaining });
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
		isCompleted,
		recurrenceType: reminder.recurrenceType,
		recurrenceInterval: reminder.recurrenceInterval,
		recurrenceEndDate: reminder.recurrenceEndDate
	});

	let completingReminderIds: Record<string, boolean> = {};
	let completingNotificationIds: Record<string, boolean> = {};
	let isMarkingAllRead = $state(false);
	let apiNotifications = $state<Notification[]>([]);
	let isLoadingNotifications = $state(false);

	const fetchNotifications = async (vehicleId: string) => {
		isLoadingNotifications = true;
		try {
			const response = await getNotifications(vehicleId);
			if (response.status === 'OK' && response.data) {
				const unreadNotifications = response.data.filter((n) => !n.isRead);
				apiNotifications = unreadNotifications;
			} else {
				apiNotifications = [];
			}
		} catch (err) {
			console.error('Failed to fetch notifications:', err);
			apiNotifications = [];
		} finally {
			isLoadingNotifications = false;
		}
	};

	const setNotificationLoading = (id: string, state: boolean) => {
		if (state) {
			completingNotificationIds = { ...completingNotificationIds, [id]: true };
			return;
		}
		completingNotificationIds = Object.fromEntries(
			Object.entries(completingNotificationIds).filter(([key]) => key !== id)
		);
	};

	const isNotificationMarking = (id?: string) =>
		id ? Boolean(completingNotificationIds[id]) : false;

	const markNotificationAsRead = async (notification: Notification) => {
		if (!vehicleStore.selectedId || !notification.id) {
			toast.error('Cannot mark notification as read');
			return;
		}
		if (isNotificationMarking(notification.id)) return;
		setNotificationLoading(notification.id, true);
		try {
			const { markNotificationAsRead: markAsReadService } =
				await import('$services/notification.service');
			const response = await markAsReadService(vehicleStore.selectedId, notification.id);
			if (response.status !== 'OK') {
				throw new Error(response.error || 'Failed to mark notification as read');
			}
			toast.success('Notification marked as read');
			// Remove from local list
			apiNotifications = apiNotifications.filter((n) => n.id !== notification.id);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to mark notification as read';
			toast.error(message);
		} finally {
			setNotificationLoading(notification.id, false);
		}
	};

	const setReminderLoading = (id: string, state: boolean) => {
		if (state) {
			completingReminderIds = { ...completingReminderIds, [id]: true };
			return;
		}
		completingReminderIds = Object.fromEntries(
			Object.entries(completingReminderIds).filter(([key]) => key !== id)
		);
	};

	const isReminderCompleting = (id?: string | null) =>
		id ? Boolean(completingReminderIds[id]) : false;

	const markReminderComplete = async (reminder: ReminderNotification) => {
		if (!reminder.id) {
			toast.error(m.notifications_error_no_id());
			return;
		}
		if (isReminderCompleting(reminder.id)) return;
		setReminderLoading(reminder.id, true);
		try {
			const response = await saveReminder(buildReminderPayload(reminder, true));
			if (response.status !== 'OK') {
				throw new Error(response.error || m.notifications_error_update_failed());
			}
			toast.success(m.notifications_success_marked_done());
			await reminderStore.refreshReminders();
		} catch (err) {
			const message = err instanceof Error ? err.message : m.notifications_error_update_failed();
			toast.error(message);
		} finally {
			setReminderLoading(reminder.id, false);
		}
	};

	const handleMarkAllAsRead = async () => {
		if (!vehicleStore.selectedId || isMarkingAllRead) return;
		isMarkingAllRead = true;
		try {
			const response = await markAllNotificationsAsRead(vehicleStore.selectedId);
			if (response.status !== 'OK') {
				throw new Error(response.error || 'Failed to mark all as read');
			}
			toast.success('All notifications marked as read');
			// Refresh notifications and other stores
			await fetchNotifications(vehicleStore.selectedId);
			await Promise.all([
				reminderStore.refreshReminders(),
				insuranceStore.refreshInsurances(),
				puccStore.refreshPuccs()
			]);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to mark all as read';
			toast.error(message);
		} finally {
			isMarkingAllRead = false;
		}
	};

	const reminderNotifications = $derived<ReminderNotification[]>(
		(() => {
			if (!vehicleStore.selectedId || !reminderStore.reminders) return [];
			const now = new Date();
			return reminderStore.reminders
				.filter((reminder) => !reminder.isCompleted)
				.map((reminder) => {
					const baseDueDate =
						reminder.dueDate instanceof Date ? reminder.dueDate : new Date(reminder.dueDate);
					const recurrenceEnd =
						reminder.recurrenceEndDate instanceof Date
							? reminder.recurrenceEndDate
							: reminder.recurrenceEndDate
								? new Date(reminder.recurrenceEndDate)
								: null;
					const nextDueDate =
						reminder.recurrenceType && reminder.recurrenceType !== 'none'
							? (getNextDueDate(
									baseDueDate,
									reminder.recurrenceType,
									reminder.recurrenceInterval ?? 1,
									recurrenceEnd
								) ?? baseDueDate)
							: baseDueDate;
					const daysRemaining = differenceInDays(nextDueDate, now);
					const severity: ReminderSeverity =
						daysRemaining < 0
							? 'critical'
							: daysRemaining <= REMINDER_URGENT_DAYS
								? 'warning'
								: 'info';
					return {
						...reminder,
						dueDate: nextDueDate,
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
		apiNotifications.length +
			reminderNotifications.length +
			alertNotifications.filter((alert) => alert.status !== 'valid').length
	);

	const notificationLoading = $derived(
		isLoadingNotifications ||
			reminderStore.processing ||
			insuranceStore.processing ||
			puccStore.processing
	);

	let hydratedVehicleId: string | undefined;

	$effect(() => {
		if (!browser || !authStore.isLoggedIn) return;
		const selectedId = vehicleStore.selectedId;
		if (!selectedId) {
			hydratedVehicleId = undefined;
			apiNotifications = [];
			reminderStore.refreshReminders();
			insuranceStore.refreshInsurances();
			puccStore.refreshPuccs();
			return;
		}
		if (hydratedVehicleId === selectedId) return;
		hydratedVehicleId = selectedId;
		fetchNotifications(selectedId);
		reminderStore.refreshReminders();
		insuranceStore.refreshInsurances();
		puccStore.refreshPuccs();
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		id="notifications-trigger"
		class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground relative inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		aria-label={m.notifications_title()}
		title={m.notifications_title()}
	>
		<Bell class="text-primary h-[1.15rem] w-[1.15rem]" />
		{#if notificationCount > 0}
			<span
				id="notification-badge"
				class="notification-count bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.65rem] leading-none font-semibold"
			>
				{notificationCount > 9 ? '9+' : notificationCount}
			</span>
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content id="notifications-menu" align="end" class="w-88 space-y-2">
		<div id="notifications-header" class="flex items-center justify-between px-2 py-1.5">
			<span class="text-sm font-semibold">{m.notifications_title()}</span>
			<div class="flex items-center gap-2">
				{#if notificationCount > 0}
					<span
						id="notifications-count-badge"
						class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold"
					>
						{notificationCount}
						{m.notifications_new()}
					</span>
					<Button
						variant="ghost"
						size="sm"
						title={m.notifications_mark_all_read_title()}
						aria-label={m.notifications_mark_all_read_aria()}
						onclick={handleMarkAllAsRead}
						disabled={isMarkingAllRead}
						class="h-7 px-2"
					>
						{#if isMarkingAllRead}
							<Loader2 class="h-3.5 w-3.5 animate-spin" />
						{:else}
							<Check class="h-3.5 w-3.5" />
						{/if}
					</Button>
				{/if}
			</div>
		</div>
		<DropdownMenu.Separator />
		{#if !vehicleStore.selectedId}
			<div
				class="notifications-empty text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm"
			>
				<AlertTriangle class="h-4 w-4" />
				<span>{m.notifications_select_vehicle_hint()}</span>
			</div>
		{:else if notificationLoading}
			<div
				class="notifications-loading text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm"
			>
				<Loader2 class="h-4 w-4 animate-spin" />
				<span>{m.notifications_syncing()}</span>
			</div>
		{:else if notificationCount === 0}
			<div
				class="notifications-success text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm"
			>
				<CheckCircle2 class="h-4 w-4" />
				<span>{m.notifications_caught_up()}</span>
			</div>
		{:else}
			<div id="notifications-list-container" class="max-h-80 space-y-3 overflow-auto px-1 py-2">
				{#if apiNotifications.length}
					<p
						class="notifications-section-title text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase"
					>
						Notifications
					</p>
					<ul id="notifications-api-list" class="space-y-2">
						{#each apiNotifications as notification (notification.id)}
							{@const notifStyle = notificationTypeStyles[notification.type]}
							{@const NotifIcon = notifStyle.icon}
							<li
								id="notification-api-{notification.id}"
								class="notification-item border-border/50 bg-background/90 flex items-center gap-3 rounded-md border px-3 py-2 shadow-sm"
							>
								<div class="rounded-full border p-1 {notifStyle.ring}">
									<NotifIcon class="h-4 w-4" />
								</div>
								<div class="flex-1">
									<div class="flex items-center justify-between gap-2">
										<p class="text-sm font-semibold">
											{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
										</p>
										<div class="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												title="Mark as read"
												aria-label="Mark notification as read"
												onclick={() => markNotificationAsRead(notification)}
												disabled={isNotificationMarking(notification.id)}
												class="h-7 px-2"
											>
												{#if isNotificationMarking(notification.id)}
													<Loader2 class="h-3.5 w-3.5 animate-spin" />
												{:else}
													<X class="h-3.5 w-3.5" />
												{/if}
											</Button>
										</div>
									</div>
									<p class="text-muted-foreground text-xs">
										{notification.message}
									</p>
									<p class="text-muted-foreground text-xs">
										Due: {format(new Date(notification.dueDate), 'MMM dd, yyyy')}
									</p>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
				{#if reminderNotifications.length}
					<p
						class="notifications-section-title text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase"
					>
						{m.notifications_section_reminders()}
					</p>
					<ul id="notifications-reminders-list" class="space-y-2">
						{#each reminderNotifications as reminder (reminder.id ?? `${reminder.vehicleId}-${reminder.dueDate.getTime()}`)}
							<li
								id="notification-reminder-{reminder.id}"
								class="notification-item border-border/50 bg-background/90 flex items-center gap-3 rounded-md border px-3 py-2 shadow-sm"
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
												title={m.notifications_mark_done_title()}
												aria-label={m.notifications_mark_done_aria({
													type: REMINDER_TYPES[reminder.type]
												})}
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
					<p
						class="notifications-section-title text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase"
					>
						{m.notifications_section_alerts()}
					</p>
					<ul id="notifications-alerts-list" class="space-y-2">
						{#each alertNotifications as alert (alert.type)}
							<li
								id="notification-alert-{alert.type}"
								class="notification-item border-border/50 bg-background/90 flex items-center gap-3 rounded-md border px-3 py-2 align-middle shadow-sm"
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
											{m.notifications_expires()}
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
