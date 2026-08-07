<script lang="ts">
  import { goto } from '$app/navigation';
  import { getLocalTimeZone, type DateValue } from '@internationalized/date';
  import { toast } from 'svelte-sonner';
  import StatCard from '$dashboard/StatCard.svelte';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import * as Select from '$ui/select/index.js';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import BellRing from '@lucide/svelte/icons/bell-ring';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
  import Clock from '@lucide/svelte/icons/clock';
  import CalendarClock from '@lucide/svelte/icons/calendar-clock';
  import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import X from '@lucide/svelte/icons/x';
  import ListFilter from '@lucide/svelte/icons/list-filter';
  import Wrench from '@lucide/svelte/icons/wrench';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import Car from '@lucide/svelte/icons/car';
  import FileText from '@lucide/svelte/icons/file-text';
  import { Features } from '$lib/helper/feature.helper';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import ReminderForm from '$feature/reminder/ReminderForm.svelte';
  import ReminderCalendar from '$feature/reminder/ReminderCalendar.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
  import Button from '$ui/button/button.svelte';
  import { reminderStore } from '$stores/reminder.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import { deleteReminder as deleteReminderService } from '$lib/services/reminder.service';
  import { ACCENT } from '$lib/helper/accent-color.helper';
  import { formatDate } from '$lib/helper/format.helper';
  import {
    REMINDER_TYPES,
    getReminderTypeLabel,
    getReminderScheduleLabel,
    getRecurrenceTypeLabel,
    type Reminder
  } from '$lib/domain/reminder';
  import * as m from '$lib/paraglide/messages';
  import {
    feature_reminders_disabled_title,
    feature_reminders_disabled_hint
  } from '$lib/paraglide/messages/_index.js';

  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  let lastScopeKey: string | undefined;
  $effect(() => {
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      reminderStore.refreshReminders(vehicleId);
    }
  });

  const allReminders = $derived(reminderStore.reminders ?? []);
  const hasAnyReminders = $derived(allReminders.length > 0);
  const isEmpty = $derived(!reminderStore.processing && !reminderStore.error && !hasAnyReminders);

  const daysUntil = (date: Date) => Math.ceil((date.getTime() - Date.now()) / 86_400_000);

  const overdueCount = $derived(
    allReminders.filter((r) => !r.isCompleted && daysUntil(r.dueDate) < 0).length
  );
  const dueSoonCount = $derived(
    allReminders.filter(
      (r) => !r.isCompleted && daysUntil(r.dueDate) >= 0 && daysUntil(r.dueDate) <= 30
    ).length
  );
  const upcomingCount = $derived(
    allReminders.filter((r) => !r.isCompleted && daysUntil(r.dueDate) > 30).length
  );
  const completedCount = $derived(allReminders.filter((r) => r.isCompleted).length);

  // Reminder due dates carry a local time-of-day, so keying by local Y/M/D lines them up with the
  // calendar's CalendarDate.toString() (an ISO date, no time) instead of drifting a day off around UTC.
  const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  let selectedDate = $state<DateValue | undefined>(undefined);
  const selectedDateKey = $derived(selectedDate?.toString());
  const selectedDateLabel = $derived(
    selectedDate ? formatDate(selectedDate.toDate(getLocalTimeZone())) : undefined
  );

  let typeFilter = $state<string>('all');
  const typeOptions = $derived([
    { id: 'all', label: m.reminder_filter_all_types() },
    ...Object.keys(REMINDER_TYPES).map((type) => ({
      id: type,
      label: getReminderTypeLabel(type, m)
    }))
  ]);
  const typeOptionLabel = $derived(
    typeOptions.find((o) => o.id === typeFilter)?.label ?? m.reminder_filter_all_types()
  );

  const baseReminders = $derived(
    (selectedDateKey
      ? allReminders.filter((r) => dateKey(r.dueDate) === selectedDateKey)
      : allReminders
    ).filter((r) => typeFilter === 'all' || r.type === typeFilter)
  );

  // Upcoming keeps the store's soonest-first order; done reminders show most recently marked first.
  const upcomingReminders = $derived(baseReminders.filter((r) => !r.isCompleted));
  const doneReminders = $derived(
    baseReminders
      .filter((r) => r.isCompleted)
      .slice()
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
  );

  const recurrenceLabel = (r: Reminder) => {
    const unit =
      r.recurrenceType === 'yearly'
        ? m.recurrence_interval_years()
        : r.recurrenceType === 'monthly'
          ? m.recurrence_interval_months()
          : r.recurrenceType === 'weekly'
            ? m.recurrence_interval_weeks()
            : m.recurrence_interval_days();
    const interval =
      r.recurrenceInterval > 1 ? ` (${m.recurrence_every()} ${r.recurrenceInterval} ${unit})` : '';
    const until = r.recurrenceEndDate
      ? ` - ${m.recurrence_until()} ${formatDate(r.recurrenceEndDate)}`
      : '';
    return `${getRecurrenceTypeLabel(r.recurrenceType, m)}${interval}${until}`;
  };

  // Second card line: vehicle, schedule, repetition (if any) and note, condensed into one row.
  const metaFor = (r: Reminder) =>
    [
      subtitleFor(r),
      getReminderScheduleLabel(r.remindSchedule, m),
      r.recurrenceType !== 'none' ? recurrenceLabel(r) : null,
      r.note
    ]
      .filter(Boolean)
      .join(' · ');

  const TYPE_STYLES: Record<Reminder['type'], { icon: typeof Wrench; bg: string; text: string }> = {
    maintenance: { icon: Wrench, bg: ACCENT.denim.soft, text: ACCENT.denim.text },
    insurance: { icon: ShieldCheck, bg: ACCENT.ochre.soft, text: ACCENT.ochre.text },
    pollution: { icon: BadgeCheck, bg: ACCENT.brick.soft, text: ACCENT.brick.text },
    registration: { icon: Car, bg: ACCENT.moss.soft, text: ACCENT.moss.text },
    inspection: { icon: FileText, bg: ACCENT.plum.soft, text: ACCENT.plum.text },
    custom: { icon: BellRing, bg: ACCENT.fog.soft, text: ACCENT.fog.text }
  };

  const reminderKey = (r: Reminder) => r.id ?? `${r.vehicleId}-${r.dueDate.getTime()}`;
  const subtitleFor = (r: Reminder) =>
    r.vehiclePlate || `${r.vehicleMake ?? ''} ${r.vehicleModel ?? ''}`.trim();

  function statusFor(r: Reminder) {
    if (r.isCompleted) {
      return { status: 'not_available' as const, badge: m.reminder_status_completed() };
    }
    const days = daysUntil(r.dueDate);
    if (days < 0) {
      return { status: 'expired' as const, badge: m.reminder_stat_overdue(), sub: `by ${-days}d` };
    }
    if (days <= 30) {
      return {
        status: 'expiring_soon' as const,
        badge: m.reminder_stat_due_soon(),
        sub: `in ${days}d`
      };
    }
    return { status: 'upcoming' as const, badge: m.reminder_stat_upcoming(), sub: `in ${days}d` };
  }

  const openEdit = (reminder: Reminder) =>
    sheetStore.openSheet(ReminderForm, m.reminder_menu_sheet_title(), '', reminder);

  let pendingDelete = $state<Reminder | null>(null);
  let showDeleteDialog = $state(false);

  const requestDelete = (reminder: Reminder) => {
    pendingDelete = reminder;
    showDeleteDialog = true;
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteReminderService(pendingDelete).then((res) => {
      if (res.status === 'OK') {
        showDeleteDialog = false;
        toast.success(m.reminder_delete_success());
        reminderStore.reloadReminders();
      } else {
        toast.error(res.error || m.reminder_delete_error());
      }
    });
  };
</script>

<FeaturePageShell
  feature={Features.REMINDERS}
  title={m.reminder_page_title()}
  description={m.reminder_page_description()}
  disabledTitle={feature_reminders_disabled_title()}
  disabledHint={feature_reminders_disabled_hint()}
>
  {#snippet actions()}
    <Button
      variant="default"
      onclick={() => sheetStore.openSheet(ReminderForm, m.reminder_add_action())}
    >
      <LabelWithIcon icon={CirclePlus} label={m.reminder_add_action()} />
    </Button>
  {/snippet}

  {#if isEmpty}
    <div
      class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-12 text-center"
    >
      <span class="flex size-16 items-center justify-center rounded-2xl {ACCENT.plum.chip}">
        <BellRing class="size-8" />
      </span>
      <div class="space-y-1">
        <h3 class="text-lg font-semibold">{m.reminder_empty_title()}</h3>
        <p class="text-muted-foreground max-w-sm text-sm">{m.reminder_list_empty()}</p>
      </div>
      <Button onclick={() => sheetStore.openSheet(ReminderForm, m.reminder_add_action())}>
        <LabelWithIcon icon={CirclePlus} label={m.reminder_add_action()} />
      </Button>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={AlertTriangle}
        label={m.reminder_stat_overdue()}
        value={overdueCount}
        color={ACCENT.brick.gradient}
      />
      <StatCard
        icon={Clock}
        label={m.reminder_stat_due_soon()}
        value={dueSoonCount}
        color={ACCENT.ochre.gradient}
      />
      <StatCard
        icon={CalendarClock}
        label={m.reminder_stat_upcoming()}
        value={upcomingCount}
        color={ACCENT.denim.gradient}
      />
      <StatCard
        icon={CheckCircle2}
        label={m.reminder_stat_completed()}
        value={completedCount}
        color={ACCENT.moss.gradient}
      />
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="bg-card flex min-h-0 flex-col rounded-xl border p-4 lg:col-span-2">
        <div class="mb-3 flex items-center justify-between gap-2">
          <h3 class="text-lg font-semibold">
            {selectedDateLabel
              ? m.reminder_list_title_for_date({ date: selectedDateLabel })
              : m.reminder_list_title()}
          </h3>
          <div class="flex items-center gap-2">
            <Select.Root type="single" bind:value={typeFilter}>
              <Select.Trigger class="w-40" size="sm">
                <span class="flex items-center gap-1.5">
                  <ListFilter class="text-muted-foreground size-3.5" />
                  {typeOptionLabel}
                </span>
              </Select.Trigger>
              <Select.Content>
                {#each typeOptions as option (option.id)}
                  <Select.Item value={option.id}>{option.label}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
            {#if selectedDateKey}
              <button
                type="button"
                class="text-primary flex items-center gap-1 text-sm font-medium"
                onclick={() => (selectedDate = undefined)}
              >
                <X class="size-3.5" />
                {m.reminder_clear_filter()}
              </button>
            {/if}
          </div>
        </div>

        {#if reminderStore.processing && upcomingReminders.length === 0 && doneReminders.length === 0}
          <p class="text-muted-foreground py-6 text-center text-sm">{m.common_loading()}</p>
        {:else if upcomingReminders.length === 0 && doneReminders.length === 0}
          <p class="text-muted-foreground py-6 text-center text-sm">
            {selectedDateKey ? m.reminder_calendar_empty_day() : m.reminder_list_empty()}
          </p>
        {:else}
          <div class="h-auto max-h-128 space-y-4 overflow-y-auto pr-1">
            {#if upcomingReminders.length > 0}
              <div>
                <h4
                  class="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase"
                >
                  {m.reminder_section_upcoming()} ({upcomingReminders.length})
                </h4>
                <ul class="space-y-2">
                  {#each upcomingReminders as reminder (reminderKey(reminder))}
                    {@render reminderRow(reminder, false)}
                  {/each}
                </ul>
              </div>
            {/if}
            {#if doneReminders.length > 0}
              <div>
                <h4
                  class="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase"
                >
                  {m.reminder_section_marked_done()} ({doneReminders.length})
                </h4>
                <ul class="space-y-2">
                  {#each doneReminders as reminder (reminderKey(reminder))}
                    {@render reminderRow(reminder, true)}
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <div class="space-y-6 lg:col-span-1">
        <div class="bg-card rounded-xl border p-4">
          <h3 class="mb-3 text-lg font-semibold">{m.reminder_calendar_title()}</h3>
          <ReminderCalendar reminders={allReminders} bind:selected={selectedDate} />
        </div>

        <div class="bg-card rounded-xl border p-4">
          <h3 class="mb-3 text-lg font-semibold">{m.reminder_quick_actions_title()}</h3>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              class="hover:bg-muted/40 flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center"
              onclick={() => sheetStore.openSheet(ReminderForm, m.reminder_add_action())}
            >
              <CirclePlus class="text-primary size-5" />
              <span class="text-xs font-medium">{m.reminder_add_action()}</span>
            </button>
            <button
              type="button"
              class="hover:bg-muted/40 flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center"
              onclick={() => goto('/maintenance')}
            >
              <Wrench class="size-5 {ACCENT.denim.text}" />
              <span class="text-xs font-medium">{m.nav_maintenance()}</span>
            </button>
            <button
              type="button"
              class="hover:bg-muted/40 flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center"
              onclick={() => goto('/compliance')}
            >
              <ShieldCheck class="size-5 {ACCENT.ochre.text}" />
              <span class="text-xs font-medium">{m.nav_compliance()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</FeaturePageShell>

{#snippet reminderRow(reminder: Reminder, done: boolean)}
  {@const typeStyle = TYPE_STYLES[reminder.type]}
  {@const info = statusFor(reminder)}
  <li class="rounded-xl border p-3 {done ? 'opacity-60' : ''}">
    <div class="flex items-start gap-3">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-lg {typeStyle.bg} {typeStyle.text}"
      >
        <typeStyle.icon class="size-4" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-row items-center gap-2">
          <p class="truncate text-sm font-medium">{getReminderTypeLabel(reminder.type, m)}</p>
          <StatusPill status={info.status} label={info.badge} />
        </div>
        <p class="text-muted-foreground truncate text-sm">{metaFor(reminder)}</p>
      </div>
      <div class="flex flex-row items-center gap-4">
        <p class="text-primary mt-0.5 flex flex-col truncate text-sm">
          {formatDate(reminder.dueDate)}
          {#if info.sub}
            <span class="text-muted-foreground">({info.sub})</span>
          {/if}
        </p>

        <div class="flex items-center justify-end gap-1">
          {#if !done}
            <Button variant="outline" size="icon" onclick={() => openEdit(reminder)}>
              <Pencil class="size-3.5" />
            </Button>
          {/if}
          <Button
            variant="outline"
            size="icon"
            class="text-destructive hover:text-destructive"
            onclick={() => requestDelete(reminder)}
          >
            <Trash2 class="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  </li>
{/snippet}

<DeleteConfirmation onConfirm={confirmDelete} bind:open={showDeleteDialog} />
