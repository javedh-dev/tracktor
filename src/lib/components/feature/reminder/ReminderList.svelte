<script lang="ts">
  import Badge from '$ui/badge/badge.svelte';
  import FeatureRecordCard from '$appui/FeatureRecordCard.svelte';
  import FeatureRecordCardSkeleton from '$appui/FeatureRecordCardSkeleton.svelte';
  import RecordDetailItem from '$appui/RecordDetailItem.svelte';
  import StoreResourceState from '$appui/StoreResourceState.svelte';
  import { reminderStore } from '$stores/reminder.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import {
    getReminderScheduleLabel,
    getRecurrenceTypeLabel,
    getReminderTypeLabel
  } from '$lib/domain/reminder';
  import { formatDate } from '$lib/helper/format.helper';
  import BellRing from '@lucide/svelte/icons/bell-ring';
  import Calendar from '@lucide/svelte/icons/calendar';
  import AlarmClock from '@lucide/svelte/icons/alarm-clock';
  import Repeat from '@lucide/svelte/icons/repeat';
  import { browser } from '$app/environment';
  import type { Reminder } from '$lib/domain/reminder';
  import FileText from '@lucide/svelte/icons/file-text';
  import ReminderContextMenu from './ReminderContextMenu.svelte';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    /** Optional predicate to narrow what's rendered (e.g. page-level type/status filter tabs). */
    filter?: (reminder: Reminder) => boolean;
  }

  let { filter }: Props = $props();

  let lastScopeKey: string | undefined;
  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  const isOverdue = (reminder: Reminder) => {
    return !reminder.isCompleted && reminder.dueDate.getTime() < Date.now();
  };

  const reminderKey = (reminder: Reminder) =>
    reminder.id ?? `${reminder.vehicleId}-${reminder.dueDate.getTime()}`;

  $effect(() => {
    if (!browser) return;
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      reminderStore.refreshReminders(vehicleId);
    }
  });
  const reminders = $derived.by(() => {
    const all = reminderStore.reminders || [];
    return filter ? all.filter(filter) : all;
  });
</script>

<StoreResourceState
  processing={reminderStore.processing}
  error={reminderStore.error}
  data={reminders}
  emptyMessage={m.reminder_list_empty()}
>
  {#snippet skeleton()}
    <FeatureRecordCardSkeleton cardClass="bg-background rounded-2xl border p-4 shadow-sm h-28" />
  {/snippet}
  {#each reminders as reminder (reminderKey(reminder))}
    <FeatureRecordCard
      id="reminder-item-{reminderKey(reminder)}"
      class="reminder-item bg-background/50"
      title={getReminderTypeLabel(reminder.type, m)}
      titleIcon={BellRing}
      titleClass="text-indigo-500 dark:text-indigo-400"
      subtitle={scope.isFleet && (reminder.vehicleMake || reminder.vehicleModel)
        ? `${reminder.vehicleMake ?? ''} ${reminder.vehicleModel ?? ''}`.trim()
        : undefined}
    >
      {#snippet headerExtras()}
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant={reminder.isCompleted ? 'secondary' : 'outline'}>
            {reminder.isCompleted ? m.reminder_status_completed() : m.reminder_status_pending()}
          </Badge>
          {#if isOverdue(reminder)}
            <Badge variant="destructive">{m.reminder_status_overdue()}</Badge>
          {/if}
        </div>
      {/snippet}

      {#snippet actions()}
        <ReminderContextMenu
          {reminder}
          onaction={() => {
            reminderStore.reloadReminders();
          }}
        />
      {/snippet}

      <RecordDetailItem
        label={m.reminder_col_due_date()}
        value={formatDate(reminder.dueDate)}
        icon={Calendar}
        class="text-gray-900 dark:text-gray-100"
      />
      <RecordDetailItem
        label={m.reminder_col_reminder_schedule()}
        value={getReminderScheduleLabel(reminder.remindSchedule, m)}
        icon={AlarmClock}
        class="text-gray-900 dark:text-gray-100"
      />
      {#if reminder.recurrenceType && reminder.recurrenceType !== 'none'}
        <RecordDetailItem
          label={m.reminder_col_recurrence()}
          icon={Repeat}
          class="text-gray-900 dark:text-gray-100"
        >
          <span>
            {getRecurrenceTypeLabel(reminder.recurrenceType, m)}
            {#if reminder.recurrenceInterval > 1}
              ({m.recurrence_every()}
              {reminder.recurrenceInterval}
              {reminder.recurrenceType === 'yearly'
                ? m.recurrence_interval_years()
                : reminder.recurrenceType === 'monthly'
                  ? m.recurrence_interval_months()
                  : reminder.recurrenceType === 'weekly'
                    ? m.recurrence_interval_weeks()
                    : m.recurrence_interval_days()})
            {/if}
            {#if reminder.recurrenceEndDate}
              - {m.recurrence_until()}
              {formatDate(reminder.recurrenceEndDate)}
            {/if}
          </span>
        </RecordDetailItem>
      {/if}
      {#if reminder.note}
        <RecordDetailItem
          label={m.reminder_col_note()}
          value={reminder.note}
          icon={FileText}
          class="text-gray-900 dark:text-gray-100"
        />
      {/if}
    </FeatureRecordCard>
  {/each}
</StoreResourceState>
