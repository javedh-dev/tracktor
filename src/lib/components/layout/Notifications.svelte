<script lang="ts">
  import Bell from '@lucide/svelte/icons/bell';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import Shield from '@lucide/svelte/icons/shield';
  import Wrench from '@lucide/svelte/icons/wrench';
  import FileText from '@lucide/svelte/icons/file-text';
  import Info from '@lucide/svelte/icons/info';
  import X from '@lucide/svelte/icons/x';

  import { browser } from '$app/environment';
  import type { Notification } from '$lib/domain/notification';
  import { notificationStore } from '$stores/notification.svelte';
  import { getLocale } from '$lib/paraglide/runtime.js';
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
    compliance: {
      ring: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-500/10',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      icon: Shield
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
    },
    information: {
      ring: 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:border-sky-500/50 dark:bg-sky-500/10',
      badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
      icon: Info
    }
  };

  let isDropdownOpen = $state(false);

  const handleNotificationClick = async (notification: Notification) => {
    isDropdownOpen = false;
    await notificationStore.markAsRead(notification);
    await notificationStore.navigate(notification);
  };

  // The bell is fleet-wide: fetch once per login rather than per vehicle scope.
  let hasFetchedNotifications = false;

  $effect(() => {
    if (!browser) return;
    if (!authStore.isLoggedIn) {
      hasFetchedNotifications = false;
      notificationStore.apiNotifications = [];
      return;
    }
    if (hasFetchedNotifications) return;
    hasFetchedNotifications = true;
    notificationStore.fetch();
  });

  const dateFormatter = $derived(new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium' }));
</script>

<DropdownMenu.Root bind:open={isDropdownOpen}>
  <DropdownMenu.Trigger
    id="notifications-trigger"
    class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground relative inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
    aria-label={m.notifications_title()}
    title={m.notifications_title()}
  >
    <Bell class="text-primary h-[1.15rem] w-[1.15rem]" />
    {#if notificationStore.unreadCount > 0}
      <span
        id="notification-badge"
        class="notification-count bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.65rem] leading-none font-semibold"
      >
        {notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount}
      </span>
    {/if}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content id="notifications-menu" align="end" class="w-88 space-y-2">
    <div id="notifications-header" class="flex items-center justify-between px-2 py-1.5">
      <span class="text-sm font-semibold">{m.notifications_title()}</span>
      <div class="flex items-center gap-2">
        {#if notificationStore.unreadCount > 0}
          <Button
            variant="ghost"
            size="sm"
            title={m.notifications_mark_all_read_aria()}
            aria-label={m.notifications_mark_all_read_aria()}
            disabled={notificationStore.isClearingAll}
            onclick={() => notificationStore.markAllAsRead()}
            class="h-7 px-2"
          >
            <span class="text-xs">{m.notif_button_mark_all_read()}</span>
          </Button>
        {/if}
        {#if notificationStore.clearableReadCount > 0}
          <Button
            variant="ghost"
            size="sm"
            title={m.notif_button_clear_all_read_title()}
            aria-label={m.notif_button_clear_all_read_title()}
            disabled={notificationStore.isClearingAll}
            onclick={() => notificationStore.clearAllRead()}
            class="h-7 px-2"
          >
            {#if notificationStore.isClearingAll}
              <Loader2 class="h-3.5 w-3.5 animate-spin" />
            {:else}
              <X class="h-3.5 w-3.5" />
            {/if}
            <span class="ml-1 text-xs">{m.notif_button_clear_read()}</span>
          </Button>
        {/if}
        {#if notificationStore.unreadCount > 0}
          <span
            id="notifications-count-badge"
            class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold"
          >
            {notificationStore.unreadCount}
            {m.notifications_new()}
          </span>
        {/if}
      </div>
    </div>
    <DropdownMenu.Separator />
    {#if notificationStore.isLoadingNotifications}
      <div
        class="notifications-loading text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm"
      >
        <Loader2 class="h-4 w-4 animate-spin" />
        <span>{m.notifications_syncing()}</span>
      </div>
    {:else if notificationStore.apiNotifications.length === 0}
      <div
        class="notifications-success text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm"
      >
        <CheckCircle2 class="h-4 w-4" />
        <span>{m.notifications_caught_up()}</span>
      </div>
    {:else}
      <div id="notifications-list-container" class="max-h-80 space-y-3 overflow-auto px-1 py-2">
        <ul id="notifications-api-list" class="space-y-2">
          {#each notificationStore.apiNotifications as notification (notification.id)}
            {@const notifStyle = notificationTypeStyles[notification.type]}
            {@const NotifIcon = notifStyle.icon}
            <li id="notification-api-{notification.id}" class="relative">
              <button
                type="button"
                onclick={() => handleNotificationClick(notification)}
                class="notification-item border-border/50 bg-background/90 hover:bg-accent/50 flex w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-left shadow-sm transition-colors"
              >
                <div class="absolute top-2 right-2">
                  {#if notification.isRead}
                    <div
                      class="border-muted-foreground/40 h-2 w-2 rounded-full border-2"
                      title={m.notif_status_read()}
                    ></div>
                  {:else}
                    <div
                      class="bg-primary h-2 w-2 rounded-full"
                      title={m.notif_status_unread()}
                    ></div>
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
                      {notification.channel.charAt(0).toUpperCase() + notification.channel.slice(1)}
                    </p>
                  </div>
                  <div class="mt-1 flex items-center gap-2">
                    <span class="text-muted-foreground text-[11px] tracking-wide uppercase">
                      {notification.type}
                    </span>
                  </div>
                  <p class="text-muted-foreground truncate text-xs">
                    {notification.message}
                  </p>
                  <p class="text-muted-foreground text-xs">
                    {m.notif_due_prefix({
                      date: dateFormatter.format(new Date(notification.dueDate))
                    })}
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
