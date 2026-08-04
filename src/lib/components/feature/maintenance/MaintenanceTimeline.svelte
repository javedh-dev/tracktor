<script lang="ts">
  import type { MaintenanceLog } from '$lib/domain/maintenance';
  import type { Reminder } from '$lib/domain/reminder';
  import { formatCurrency, formatDate, formatDistance } from '$lib/helper/format.helper';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import CalendarClock from '@lucide/svelte/icons/calendar-clock';
  import * as m from '$lib/paraglide/messages';

  let {
    logs,
    reminders,
    isFleet
  }: { logs: MaintenanceLog[]; reminders: Reminder[]; isFleet: boolean } = $props();

  const daysUntil = (date: Date) => Math.ceil((date.getTime() - Date.now()) / 86_400_000);

  const upcoming = $derived(
    reminders
      .filter((r) => !r.isCompleted)
      .slice()
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  );

  const nextReminder = $derived(upcoming[0]);
  const reminderKey = (r: Reminder) => r.id ?? `${r.vehicleId}-${r.dueDate.getTime()}`;
  const reminderTitle = (r: Reminder) =>
    isFleet
      ? `${r.vehicleMake ?? ''} ${r.vehicleModel ?? ''}`.trim() ||
        m.maintenance_next_service_fallback()
      : r.note || m.maintenance_next_service_fallback();

  type TimelineEntry =
    | { kind: 'upcoming'; key: string; date: Date; reminder: Reminder }
    | { kind: 'completed'; key: string; date: Date; log: MaintenanceLog };

  const timelineEntries = $derived<TimelineEntry[]>([
    ...upcoming.map(
      (r) => ({ kind: 'upcoming', key: reminderKey(r), date: r.dueDate, reminder: r }) as const
    ),
    ...logs.map((l) => ({ kind: 'completed', key: `log-${l.id}`, date: l.date, log: l }) as const)
  ]);
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div
    class="flex flex-col rounded-xl border bg-gradient-to-br from-blue-50/60 to-transparent p-5 lg:col-span-1 dark:from-blue-950/20"
  >
    <div class="mb-4 flex items-center gap-2">
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500"
      >
        <CalendarClock class="size-4" />
      </span>
      <h4 class="font-semibold">{m.maintenance_stat_next_service()}</h4>
    </div>

    {#if nextReminder}
      {@const days = daysUntil(nextReminder.dueDate)}
      <StatusPill
        status={days < 0 ? 'expired' : days <= 7 ? 'expiring_soon' : 'valid'}
        label={days < 0 ? m.reminder_status_overdue() : days === 0 ? 'Today' : `in ${days}d`}
      />
      <p class="mt-3 text-2xl font-bold tabular-nums">{formatDate(nextReminder.dueDate)}</p>
      {#if isFleet}
        <p class="text-muted-foreground mt-1 text-sm font-medium">
          {`${nextReminder.vehicleMake ?? ''} ${nextReminder.vehicleModel ?? ''}`.trim()}
        </p>
      {/if}
      <p class="text-muted-foreground mt-2 text-sm">
        {nextReminder.note || m.maintenance_next_service_fallback()}
      </p>

      {#if upcoming.length > 1}
        <div class="mt-4 space-y-2 border-t pt-4">
          <p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {m.maintenance_also_upcoming()}
          </p>
          {#each upcoming.slice(1, 4) as reminder (reminderKey(reminder))}
            <div class="flex items-center justify-between gap-2 text-sm">
              <span class="text-muted-foreground truncate">{reminderTitle(reminder)}</span>
              <span class="shrink-0 font-medium">{formatDate(reminder.dueDate)}</span>
            </div>
          {/each}
        </div>
      {/if}
    {:else}
      <div
        class="text-muted-foreground flex flex-1 items-center justify-center text-center text-sm"
      >
        {m.maintenance_upcoming_empty()}
      </div>
    {/if}
  </div>

  <div class="lg:col-span-2">
    {#if timelineEntries.length === 0}
      <div class="text-muted-foreground flex h-32 items-center justify-center text-sm">
        {m.maintenance_history_empty()}
      </div>
    {:else}
      <ol class="space-y-6">
        {#each timelineEntries as entry, i (entry.key)}
          <li class="relative flex gap-4 pl-1">
            <div class="flex flex-col items-center">
              <span
                class="size-2.5 shrink-0 rounded-full {entry.kind === 'upcoming'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'}"
              ></span>
              {#if i < timelineEntries.length - 1}
                <span class="bg-border mt-1 w-px flex-1"></span>
              {/if}
            </div>
            <div class="min-w-0 flex-1 pb-1">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold tabular-nums">{formatDate(entry.date)}</p>
                {#if entry.kind === 'upcoming'}
                  {@const days = daysUntil(entry.reminder.dueDate)}
                  <StatusPill
                    status={days < 0 ? 'expired' : days <= 7 ? 'expiring_soon' : 'valid'}
                    label={days < 0
                      ? m.reminder_status_overdue()
                      : days === 0
                        ? 'Today'
                        : `in ${days}d`}
                  />
                {:else}
                  <span
                    class="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  >
                    {m.reminder_status_completed()}
                  </span>
                {/if}
              </div>
              {#if entry.kind === 'upcoming'}
                <p class="text-muted-foreground truncate text-sm">
                  {reminderTitle(entry.reminder)}
                </p>
              {:else}
                <p class="truncate text-sm font-medium">
                  {#if isFleet}
                    {`${entry.log.vehicleMake ?? ''} ${entry.log.vehicleModel ?? ''}`.trim()} · {entry
                      .log.serviceCenter}
                  {:else}
                    {entry.log.serviceCenter}
                  {/if}
                </p>
                <p class="text-muted-foreground text-xs">at {formatDistance(entry.log.odometer)}</p>
                {#if entry.log.cost}
                  <p class="mt-0.5 text-sm font-semibold">{formatCurrency(entry.log.cost)}</p>
                {/if}
              {/if}
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</div>
