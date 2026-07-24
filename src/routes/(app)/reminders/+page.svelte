<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import { apiClient } from '$lib/helper/api.helper';
  import Bell from '@lucide/svelte/icons/bell';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import BadgeInfo from '@lucide/svelte/icons/badge-info';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import { Features } from '$lib/helper/feature.helper';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import { feature_reminders_disabled_title, feature_reminders_disabled_hint } from '$lib/paraglide/messages/_index.js';

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
  let loading = $state(true);
  let activeTab = $state('upcoming');

  onMount(async () => {
    try {
      const { data: res } = await apiClient.get<{ success: boolean; data: ReminderRecord[] }>(
        '/reminders?status=upcoming'
      );
      if (res.success && res.data) {
        reminders = res.data;
      }
    } catch (err) {
      console.error('Failed to fetch reminders', err);
    } finally {
      loading = false;
    }
  });

  const typeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return Wrench;
      case 'insurance': return Shield;
      case 'pollution': return BadgeInfo;
      default: return Bell;
    }
  };

  const filteredReminders = $derived(
    activeTab === 'all'
      ? reminders
      : activeTab === 'service'
        ? reminders.filter((r) => r.type === 'maintenance')
        : activeTab === 'puc'
          ? reminders.filter((r) => r.type === 'pollution')
          : activeTab === 'insurance'
            ? reminders.filter((r) => r.type === 'insurance')
            : reminders.filter((r) => r.type === 'others')
  );

  const tabs = [
    { id: 'upcoming', label: 'All' },
    { id: 'service', label: 'Service' },
    { id: 'puc', label: 'PUC' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'others', label: 'Others' }
  ];
</script>

<FeatureGate feature={Features.REMINDERS}>
  {#snippet children()}
    <div class="space-y-6">
      <PageHeader title="Reminders" description="Fleet-wide reminders overview" />

      <!-- Tabs -->
      <div class="flex gap-2">
        {#each tabs as tab}
          <button
            onclick={() => activeTab = tab.id}
            class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {activeTab === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}"
          >
            {tab.label}
          </button>
        {/each}
      </div>

      <!-- Reminders List -->
      {#if loading}
        <div class="text-muted-foreground py-8 text-center">Loading reminders...</div>
      {:else if filteredReminders.length === 0}
        <div class="text-muted-foreground py-8 text-center">No reminders found</div>
      {:else}
        <div class="bg-card divide-y rounded-xl border">
          {#each filteredReminders as reminder (reminder.id)}
            {@const Icon = typeIcon(reminder.type)}
            {@const dueDate = new Date(reminder.dueDate)}
            {@const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))}
            <div class="flex items-center gap-4 px-4 py-3">
              <div class="bg-secondary flex size-10 items-center justify-center rounded-full">
                <Icon class="text-primary size-4" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">
                  {reminder.vehicleMake} {reminder.vehicleModel}
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
                <StatusPill
                  status={daysUntilDue <= 0 ? 'expired' : daysUntilDue <= 7 ? 'expiring_soon' : 'valid'}
                  label={daysUntilDue <= 0 ? 'Overdue' : `in ${daysUntilDue}d`}
                />
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/snippet}
  {#snippet fallback()}
    <div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <div class="text-center">
        <p class="text-muted-foreground text-lg font-medium">{feature_reminders_disabled_title()}</p>
        <p class="text-muted-foreground text-sm">{feature_reminders_disabled_hint()}</p>
      </div>
    </div>
  {/snippet}
</FeatureGate>
