<script lang="ts">
  import StatusPill from '$dashboard/StatusPill.svelte';
  import Bell from '@lucide/svelte/icons/bell';
  import type { DashboardSummary } from '$lib/domain/dashboard';
  import { ACCENT } from '$lib/helper/accent-color.helper';
  import { widget_no_upcoming_reminders } from '$lib/paraglide/messages/_index.js';

  let { summary, loading }: { summary: DashboardSummary | null; loading: boolean } = $props();
</script>

{#if summary && summary.compliance.upcomingReminders.length > 0}
  <div class="h-full divide-y overflow-y-auto">
    {#each summary.compliance.upcomingReminders.slice(0, 6) as reminder (reminder.id)}
      <div
        class="hover:bg-muted/40 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-lg {ACCENT.plum.chip}"
        >
          <Bell class="size-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">
            {reminder.vehicleName}
            {#if reminder.vehiclePlate}
              <span class="text-muted-foreground">({reminder.vehiclePlate})</span>
            {/if}
          </p>
          <p class="text-muted-foreground truncate text-xs">
            {reminder.note || reminder.type}
          </p>
        </div>
        <StatusPill
          status={reminder.daysUntilDue <= 7
            ? 'expiring_soon'
            : reminder.daysUntilDue <= 0
              ? 'expired'
              : 'valid'}
          label={reminder.daysUntilDue === 0 ? 'Today' : `in ${reminder.daysUntilDue}d`}
        />
      </div>
    {/each}
  </div>
{:else if loading}
  <div class="text-muted-foreground py-4 text-sm">Loading reminders...</div>
{:else}
  <div class="text-muted-foreground flex h-full items-center justify-center text-sm">
    {widget_no_upcoming_reminders()}
  </div>
{/if}
