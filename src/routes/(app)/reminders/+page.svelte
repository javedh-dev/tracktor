<script lang="ts">
  import { goto } from '$app/navigation';
  import { getLocalTimeZone, type DateValue } from '@internationalized/date';
  import { toast } from 'svelte-sonner';
  import FilterTabs from '$dashboard/FilterTabs.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import BellRing from '@lucide/svelte/icons/bell-ring';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
  import Clock from '@lucide/svelte/icons/clock';
  import CalendarClock from '@lucide/svelte/icons/calendar-clock';
  import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import X from '@lucide/svelte/icons/x';
  import Wrench from '@lucide/svelte/icons/wrench';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import Car from '@lucide/svelte/icons/car';
  import FileText from '@lucide/svelte/icons/file-text';
  import { Features } from '$lib/helper/feature.helper';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import ReminderForm from '$feature/reminder/ReminderForm.svelte';
  import ReminderList from '$feature/reminder/ReminderList.svelte';
  import ReminderCalendar from '$feature/reminder/ReminderCalendar.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
  import Button from '$ui/button/button.svelte';
  import { reminderStore } from '$stores/reminder.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import { deleteReminder as deleteReminderService } from '$lib/services/reminder.service';
  import { formatDate } from '$lib/helper/format.helper';
  import { getReminderTypeLabel, type Reminder } from '$lib/domain/reminder';
  import * as m from '$lib/paraglide/messages';
  import {
    feature_reminders_disabled_title,
    feature_reminders_disabled_hint
  } from '$lib/paraglide/messages/_index.js';

  let typeFilter = $state<string>('upcoming');
  let showFullList = $state(false);

  const tabs = [
    { id: 'upcoming', label: m.reminder_filter_all() },
    { id: 'service', label: m.reminder_filter_service() },
    { id: 'puc', label: m.reminder_filter_puc() },
    { id: 'insurance', label: m.reminder_filter_insurance() },
    { id: 'others', label: m.reminder_filter_others() }
  ];

  function matchesTypeFilter(reminder: Reminder): boolean {
    switch (typeFilter) {
      case 'service':
        return reminder.type === 'maintenance';
      case 'puc':
        return reminder.type === 'pollution';
      case 'insurance':
        return reminder.type === 'insurance';
      case 'others':
        return !['maintenance', 'pollution', 'insurance'].includes(reminder.type);
      default:
        return true;
    }
  }

  const upcomingFilter = (reminder: Reminder) =>
    !reminder.isCompleted && matchesTypeFilter(reminder);
  const completedFilter = (reminder: Reminder) =>
    reminder.isCompleted && matchesTypeFilter(reminder);

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

  // Default view: upcoming (soonest first, already sorted that way by the store) followed by
  // completed history (most recently completed first) — so the contained list covers both.
  const mergedReminders = $derived([
    ...allReminders.filter((r) => !r.isCompleted),
    ...allReminders
      .filter((r) => r.isCompleted)
      .slice()
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
  ]);

  const displayedReminders = $derived(
    selectedDateKey
      ? allReminders.filter((r) => dateKey(r.dueDate) === selectedDateKey)
      : mergedReminders
  );

  const TYPE_STYLES: Record<Reminder['type'], { icon: typeof Wrench; bg: string; text: string }> = {
    maintenance: { icon: Wrench, bg: 'bg-blue-500/10', text: 'text-blue-500' },
    insurance: { icon: ShieldCheck, bg: 'bg-amber-500/10', text: 'text-amber-500' },
    pollution: { icon: BadgeCheck, bg: 'bg-red-500/10', text: 'text-red-500' },
    registration: { icon: Car, bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    inspection: { icon: FileText, bg: 'bg-violet-500/10', text: 'text-violet-500' },
    custom: { icon: BellRing, bg: 'bg-slate-500/10', text: 'text-slate-500' }
  };

  const reminderKey = (r: Reminder) => r.id ?? `${r.vehicleId}-${r.dueDate.getTime()}`;
  const subtitleFor = (r: Reminder) =>
    r.vehiclePlate || `${r.vehicleMake ?? ''} ${r.vehicleModel ?? ''}`.trim();

  function statusFor(r: Reminder) {
    if (r.isCompleted) {
      return { status: 'valid' as const, badge: m.reminder_status_completed() };
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
      <span
        class="flex size-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500"
      >
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
        color="bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30"
      />
      <StatCard
        icon={Clock}
        label={m.reminder_stat_due_soon()}
        value={dueSoonCount}
        color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
      />
      <StatCard
        icon={CalendarClock}
        label={m.reminder_stat_upcoming()}
        value={upcomingCount}
        color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
      />
      <StatCard
        icon={CheckCircle2}
        label={m.reminder_stat_completed()}
        value={completedCount}
        color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
      />
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="bg-card flex min-h-0 flex-col rounded-xl border p-4 lg:col-span-1">
        <div class="mb-3 flex items-center justify-between gap-2">
          <h3 class="text-lg font-semibold">
            {selectedDateLabel
              ? m.reminder_list_title_for_date({ date: selectedDateLabel })
              : m.reminder_list_title()}
          </h3>
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

        {#if reminderStore.processing && displayedReminders.length === 0}
          <p class="text-muted-foreground py-6 text-center text-sm">{m.common_loading()}</p>
        {:else if displayedReminders.length === 0}
          <p class="text-muted-foreground py-6 text-center text-sm">
            {selectedDateKey ? m.reminder_calendar_empty_day() : m.reminder_list_empty()}
          </p>
        {:else}
          <ul class="h-auto max-h-128 space-y-2 overflow-y-auto pr-1">
            {#each displayedReminders as reminder (reminderKey(reminder))}
              {@const typeStyle = TYPE_STYLES[reminder.type]}
              {@const info = statusFor(reminder)}
              <li class="rounded-xl border p-3">
                <div class="flex items-start gap-3">
                  <span
                    class="flex size-10 shrink-0 items-center justify-center rounded-lg {typeStyle.bg} {typeStyle.text}"
                  >
                    <typeStyle.icon class="size-4" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-row gap-2">
                      <p class="truncate text-sm font-medium">
                        {getReminderTypeLabel(reminder.type, m)}
                      </p>
                      <div class="flex shrink-0 flex-col items-end gap-1">
                        <StatusPill status={info.status} label={info.badge} />
                      </div>
                    </div>

                    {#if subtitleFor(reminder)}
                      <p class="text-muted-foreground truncate text-sm">{subtitleFor(reminder)}</p>
                    {/if}
                  </div>
                  <div class="flex flex-row items-center gap-4">
                    <p class="text-primary mt-0.5 flex flex-col truncate text-sm">
                      {formatDate(reminder.dueDate)}
                      {#if info.sub}
                        <span class="text-muted-foreground">({info.sub})</span>
                      {/if}
                    </p>

                    <div class="flex items-center justify-end gap-1">
                      <Button variant="outline" size="icon" onclick={() => openEdit(reminder)}>
                        <Pencil class="size-3.5" />
                      </Button>
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
            {/each}
          </ul>
        {/if}
      </div>

      <div class="space-y-6 lg:col-span-1">
        <div class="bg-card rounded-xl border p-4">
          <h3 class="mb-3 text-lg font-semibold">{m.reminder_calendar_title()}</h3>
          <ReminderCalendar reminders={allReminders} bind:selected={selectedDate} />
        </div>

        <div class="bg-card rounded-xl border p-4">
          <h3 class="mb-3 text-lg font-semibold">{m.reminder_quick_actions_title()}</h3>
          <div class="grid grid-cols-4 gap-2">
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
              <Wrench class="size-5 text-blue-500" />
              <span class="text-xs font-medium">{m.nav_maintenance()}</span>
            </button>
            <button
              type="button"
              class="hover:bg-muted/40 flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center"
              onclick={() => goto('/insurance')}
            >
              <ShieldCheck class="size-5 text-amber-500" />
              <span class="text-xs font-medium">{m.nav_insurance()}</span>
            </button>
            <button
              type="button"
              class="hover:bg-muted/40 flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center"
              onclick={() => goto('/pollution')}
            >
              <BadgeCheck class="size-5 text-red-500" />
              <span class="text-xs font-medium">{m.nav_pollution()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t pt-2">
      <button
        type="button"
        class="text-primary flex items-center gap-1 text-sm font-medium"
        onclick={() => (showFullList = !showFullList)}
      >
        {showFullList ? m.common_view_less() : m.reminder_manage_all_action()}
        <ChevronRight class="size-3.5" />
      </button>
    </div>

    {#if showFullList}
      <FilterTabs {tabs} bind:value={typeFilter} />

      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{m.reminder_section_upcoming()}</h3>
        <ReminderList filter={upcomingFilter} />
      </div>

      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{m.reminder_section_completed()}</h3>
        <ReminderList filter={completedFilter} />
      </div>
    {/if}
  {/if}
</FeaturePageShell>

<DeleteConfirmation onConfirm={confirmDelete} bind:open={showDeleteDialog} />
