<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Shield from '@lucide/svelte/icons/shield';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Leaf from '@lucide/svelte/icons/leaf';
	import FileText from '@lucide/svelte/icons/file-text';
	import X from '@lucide/svelte/icons/x';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { Notification } from '$lib/domain/notification';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { format } from 'date-fns';
	import { getNotifications, deleteNotification } from '$services/notification.service';
	import { toast } from 'svelte-sonner';
	import { authStore } from '$lib/stores/auth.svelte';
	import * as DropdownMenu from '../ui/dropdown-menu';
	import Button from '../ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages/_index.js';

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

	let markingAsReadIds: Record<string, boolean> = {};
	let apiNotifications = $state<Notification[]>([]);
	let isLoadingNotifications = $state(false);
	let isClearingAll = $state(false);
	let isDropdownOpen = $state(false);

	const fetchNotifications = async (vehicleId: string) => {
		isLoadingNotifications = true;
		try {
			const response = await getNotifications(vehicleId);
			if (response.status === 'OK' && response.data) {
				apiNotifications = response.data;
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

	const setMarkingAsReadLoading = (id: string, state: boolean) => {
		if (state) {
			markingAsReadIds = { ...markingAsReadIds, [id]: true };
			return;
		}
		markingAsReadIds = Object.fromEntries(
			Object.entries(markingAsReadIds).filter(([key]) => key !== id)
		);
	};

	const isNotificationMarkingAsRead = (id?: string) => (id ? Boolean(markingAsReadIds[id]) : false);

	const handleNotificationClick = async (notification: Notification) => {
		// Close the dropdown immediately
		isDropdownOpen = false;

		// Only mark as read if it's unread
		if (!notification.isRead && vehicleStore.selectedId && notification.id) {
			if (isNotificationMarkingAsRead(notification.id)) return;
			setMarkingAsReadLoading(notification.id, true);
			try {
				const { markNotificationAsRead: markAsReadService } =
					await import('$services/notification.service');
				const response = await markAsReadService(vehicleStore.selectedId, notification.id);
				if (response.status === 'OK') {
					// Update local state
					apiNotifications = apiNotifications.map((n) =>
						n.id === notification.id ? { ...n, isRead: true } : n
					);
				}
			} catch (err) {
				console.error('Failed to mark as read:', err);
			} finally {
				setMarkingAsReadLoading(notification.id, false);
			}
		}

		// Navigate to the appropriate page based on notification type
		const navigationMap: Record<NotificationType, string> = {
			insurance: '/dashboard/insurance',
			pollution: '/dashboard/pollution',
			reminder: '/dashboard/reminders',
			maintenance: '/dashboard/maintenance',
			registration: '/dashboard', // Default to dashboard for now
			alert: '/dashboard' // Default to dashboard for now
		};

		const targetPath = navigationMap[notification.type];
		if (targetPath) {
			await goto(targetPath);
		}
	};

	const handleClearAllRead = async () => {
		if (!vehicleStore.selectedId || isClearingAll) return;

		const readNotifications = apiNotifications.filter((n) => n.isRead);
		if (readNotifications.length === 0) return;

		isClearingAll = true;
		try {
			// Delete all read notifications
			const deletePromises = readNotifications.map((notification) =>
				deleteNotification(vehicleStore.selectedId!, notification.id!)
			);

			const results = await Promise.allSettled(deletePromises);

			// Count successful deletions
			const successCount = results.filter((r) => r.status === 'fulfilled').length;
			const failCount = results.filter((r) => r.status === 'rejected').length;

			// Remove successfully deleted notifications from local state
			const deletedIds = readNotifications
				.map((n) => n.id)
				.filter((_, index) => results[index].status === 'fulfilled');

			apiNotifications = apiNotifications.filter((n) => !deletedIds.includes(n.id));

			// Show appropriate toast message
			if (failCount === 0) {
				toast.success(`Cleared ${successCount} read notification${successCount > 1 ? 's' : ''}`);
			} else if (successCount > 0) {
				toast.warning(
					`Cleared ${successCount} notification${successCount > 1 ? 's' : ''}, ${failCount} failed`
				);
			} else {
				toast.error('Failed to clear read notifications');
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to clear read notifications';
			toast.error(message);
		} finally {
			isClearingAll = false;
		}
	};

	const unreadCount = $derived(apiNotifications.filter((n) => !n.isRead).length);
	const readCount = $derived(apiNotifications.filter((n) => n.isRead).length);

	let hydratedVehicleId: string | undefined;

	$effect(() => {
		if (!browser || !authStore.isLoggedIn) return;
		const selectedId = vehicleStore.selectedId;
		if (!selectedId) {
			hydratedVehicleId = undefined;
			apiNotifications = [];
			return;
		}
		if (hydratedVehicleId === selectedId) return;
		hydratedVehicleId = selectedId;
		fetchNotifications(selectedId);
	});
</script>

<DropdownMenu.Root bind:open={isDropdownOpen}>
	<DropdownMenu.Trigger
		id="notifications-trigger"
		class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground relative inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		aria-label={m.notifications_title()}
		title={m.notifications_title()}
	>
		<Bell class="text-primary h-[1.15rem] w-[1.15rem]" />
		{#if unreadCount > 0}
			<span
				id="notification-badge"
				class="notification-count bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.65rem] leading-none font-semibold"
			>
				{unreadCount > 9 ? '9+' : unreadCount}
			</span>
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content id="notifications-menu" align="end" class="w-88 space-y-2">
		<div id="notifications-header" class="flex items-center justify-between px-2 py-1.5">
			<span class="text-sm font-semibold">{m.notifications_title()}</span>
			<div class="flex items-center gap-2">
				{#if readCount > 0}
					<Button
						variant="ghost"
						size="sm"
						title="Clear all read notifications"
						aria-label="Clear all read notifications"
						disabled={isClearingAll}
						onclick={handleClearAllRead}
						class="h-7 px-2"
					>
						{#if isClearingAll}
							<Loader2 class="h-3.5 w-3.5 animate-spin" />
						{:else}
							<X class="h-3.5 w-3.5" />
						{/if}
						<span class="ml-1 text-xs">Clear All</span>
					</Button>
				{/if}
				{#if unreadCount > 0}
					<span
						id="notifications-count-badge"
						class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold"
					>
						{unreadCount}
						{m.notifications_new()}
					</span>
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
		{:else if isLoadingNotifications}
			<div
				class="notifications-loading text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm"
			>
				<Loader2 class="h-4 w-4 animate-spin" />
				<span>{m.notifications_syncing()}</span>
			</div>
		{:else if apiNotifications.length === 0}
			<div
				class="notifications-success text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm"
			>
				<CheckCircle2 class="h-4 w-4" />
				<span>{m.notifications_caught_up()}</span>
			</div>
		{:else}
			<div id="notifications-list-container" class="max-h-80 space-y-3 overflow-auto px-1 py-2">
				<ul id="notifications-api-list" class="space-y-2">
					{#each apiNotifications as notification (notification.id)}
						{@const notifStyle = notificationTypeStyles[notification.type]}
						{@const NotifIcon = notifStyle.icon}
						<li id="notification-api-{notification.id}" class="relative">
							<button
								type="button"
								onclick={() => handleNotificationClick(notification)}
								class="notification-item border-border/50 bg-background/90 hover:bg-accent/50 flex w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-left shadow-sm transition-colors"
							>
								<!-- Read/Unread indicator dot in top-right corner -->
								<div class="absolute top-2 right-2">
									{#if notification.isRead}
										<!-- Hollow gray dot for read notifications -->
										<div
											class="border-muted-foreground/40 h-2 w-2 rounded-full border-2"
											title="Read"
										></div>
									{:else}
										<!-- Solid blue dot for unread notifications -->
										<div class="bg-primary h-2 w-2 rounded-full" title="Unread"></div>
									{/if}
								</div>
								<div class="rounded-full border p-1 {notifStyle.ring}">
									<NotifIcon class="h-4 w-4" />
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center justify-between gap-2">
										<p
											class="text-sm font-semibold {notification.isRead
												? 'text-muted-foreground'
												: ''}"
										>
											{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
										</p>
									</div>
									<p class="text-muted-foreground truncate text-xs">
										{notification.message}
									</p>
									<p class="text-muted-foreground text-xs">
										Due: {format(new Date(notification.dueDate), 'MMM dd, yyyy')}
									</p>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
