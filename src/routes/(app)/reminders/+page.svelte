<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import FilterTabs from '$dashboard/FilterTabs.svelte';
  import { apiClient } from '$lib/helper/api.helper';
  import Bell from '@lucide/svelte/icons/bell';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import BadgeInfo from '@lucide/svelte/icons/badge-info';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';

  import { Features } from '$lib/helper/feature.helper';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import ReminderForm from '$feature/reminder/ReminderForm.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Button from '$ui/button/button.svelte';
  import * as m from '$lib/paraglide/messages';
  import {
    feature_reminders_disabled_title,
    feature_reminders_disabled_hint
  } from '$lib/paraglide/messages/_index.js';

  interface ReminderRecord {
    id: string;
    vehicleId: string;
    type: string;
    note: string | null;
    dueDate: string;
    isCompleted: boolean;
    vehicleMake: string;
    vehicleModel: string;
    vehiclePlate: string | null;
  }

  let reminders = $state<ReminderRecord[]>([]);
  let completedReminders = $state<ReminderRecord[]>([]);
  let loading = $state(true);
  let activeTab = $state('upcoming');

  async function fetchReminders() {
    loading = true;
    try {
      const [upcomingRes, completedRes] = await Promise.all([
        apiClient.get<{ success: boolean; data: ReminderRecord[] }>('/reminders?status=upcoming'),
        apiClient.get<{ success: boolean; data: ReminderRecord[] }>('/reminders?status=completed')
      ]);
      if (upcomingRes.data.success && upcomingRes.data.data) {
        reminders = upcomingRes.data.data;
      }
      if (completedRes.data.success && completedRes.data.data) {
        completedReminders = completedRes.data.data;
      }
    } catch (err) {
      console.error('Failed to fetch reminders', err);
    } finally {
      loading = false;
    }
  }

  onMount(fetchReminders);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return Wrench;
      case 'insurance':
        return Shield;
      case 'pollution':
        return BadgeInfo;
      default:
        return Bell;
    }
  };

  const typeIconColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'bg-amber-500/10 text-amber-500';
      case 'insurance':
        return 'bg-sky-500/10 text-sky-500';
      case 'pollution':
        return 'bg-violet-500/10 text-violet-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  const byType = (list: ReminderRecord[]) =>
    activeTab === 'upcoming'
      ? list
      : activeTab === 'service'
        ? list.filter((r) => r.type === 'maintenance')
        : activeTab === 'puc'
          ? list.filter((r) => r.type === 'pollution')
          : activeTab === 'insurance'
            ? list.filter((r) => r.type === 'insurance')
            : list.filter((r) => !['maintenance', 'pollution', 'insurance'].includes(r.type));

  const filteredReminders = $derived(byType(reminders));
  const filteredCompletedReminders = $derived(byType(completedReminders));

  const tabs = [
    { id: 'upcoming', label: 'All' },
    { id: 'service', label: 'Service' },
    { id: 'puc', label: 'PUC' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'others', label: 'Others' }
  ];
</script>

{#snippet reminderRow(reminder: ReminderRecord, completed: boolean)}
  {@const Icon = typeIcon(reminder.type)}
  {@const dueDate = new Date(reminder.dueDate)}
  {@const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))}
  <div class="flex items-center gap-4 px-4 py-3">
    <div
      class={`flex size-10 shrink-0 items-center justify-center rounded-lg ${typeIconColor(reminder.type)}`}
    >
      <Icon class="size-4" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">
        {reminder.vehicleMake}
        {reminder.vehicleModel}
        {#if reminder.vehiclePlate}
          <span class="text-muted-foreground">({reminder.vehiclePlate})</span>
        {/if}
      </p>
      <p class="text-muted-foreground text-xs capitalize">{reminder.type}</p>
      {#if reminder.note}
        <p class="text-muted-foreground truncate text-xs">{reminder.note}</p>
      {/if}
    </div>
    <div class="text-right text-sm">
      <p class="font-medium">{dueDate.toLocaleDateString()}</p>
      {#if completed}
        <StatusPill status="valid" label="Completed" />
      {:else}
        <StatusPill
          status={daysUntilDue <= 0 ? 'expired' : daysUntilDue <= 7 ? 'expiring_soon' : 'valid'}
          label={daysUntilDue <= 0 ? 'Overdue' : `in ${daysUntilDue}d`}
        />
      {/if}
    </div>
  </div>
{/snippet}

<FeatureGate feature={Features.REMINDERS}>
  {#snippet children()}
    <div class="space-y-6">
      <PageHeader title="Reminders" description="Fleet-wide reminders overview">
        <Button
          variant="default"
          onclick={() => sheetStore.openSheet(ReminderForm, m.reminder_add_action())}
        >
          <LabelWithIcon icon={CirclePlus} label={m.reminder_add_action()} />
        </Button>
      </PageHeader>

      <!-- Tabs -->
      <FilterTabs {tabs} bind:value={activeTab} />

      <!-- Upcoming Reminders -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">Upcoming</h3>
        {#if loading}
          <div class="text-muted-foreground py-8 text-center">Loading reminders...</div>
        {:else if filteredReminders.length === 0}
          <div class="text-muted-foreground py-8 text-center">No upcoming reminders</div>
        {:else}
          <div class="bg-card divide-y rounded-xl border">
            {#each filteredReminders as reminder (reminder.id)}
              {@render reminderRow(reminder, false)}
            {/each}
          </div>
        {/if}
      </div>

      <!-- Completed Reminders -->
      {#if !loading && filteredCompletedReminders.length > 0}
        <div class="space-y-3">
          <h3 class="text-lg font-semibold">Completed</h3>
          <div class="bg-card divide-y rounded-xl border">
            {#each filteredCompletedReminders as reminder (reminder.id)}
              {@render reminderRow(reminder, true)}
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/snippet}
  {#snippet fallback()}
    <div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <div class="text-center">
        <p class="text-muted-foreground text-lg font-medium">
          {feature_reminders_disabled_title()}
        </p>
        <p class="text-muted-foreground text-sm">{feature_reminders_disabled_hint()}</p>
      </div>
    </div>
  {/snippet}
</FeatureGate>
