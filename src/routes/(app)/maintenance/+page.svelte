<script lang="ts">
  import StatCard from '$dashboard/StatCard.svelte';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import Gauge from '@lucide/svelte/icons/gauge';
  import HeartPulse from '@lucide/svelte/icons/heart-pulse';
  import Wrench from '@lucide/svelte/icons/wrench';
  import DollarSign from '@lucide/svelte/icons/dollar-sign';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import { maintenanceStore } from '$stores/maintenance.svelte';
  import { reminderStore } from '$stores/reminder.svelte';
  import MaintenenceLogTab from '$feature/maintenance/MaintenenceLogTab.svelte';
  import MaintenanceTimeline from '$feature/maintenance/MaintenanceTimeline.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import * as Tabs from '$ui/tabs';
  import { formatCurrency, formatDate } from '$lib/helper/format.helper';
  import {
    feature_maintenance_disabled_title,
    feature_maintenance_disabled_hint,
    maintenance_page_title,
    maintenance_page_description,
    maintenance_stat_last_service,
    maintenance_stat_next_service,
    maintenance_stat_odometer,
    maintenance_stat_total_services,
    maintenance_stat_total_spent,
    maintenance_stat_due_soon,
    maintenance_tab_overview,
    maintenance_tab_history
  } from '$lib/paraglide/messages/_index.js';

  let lastScopeKey: string | undefined;

  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  $effect(() => {
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      maintenanceStore.refreshMaintenanceLogs(vehicleId);
      reminderStore.refreshReminders(vehicleId);
    }
  });

  const logs = $derived(maintenanceStore.maintenanceLogs ?? []);
  const maintenanceReminders = $derived(
    (reminderStore.reminders ?? []).filter((r) => r.type === 'maintenance')
  );
  const upcomingReminders = $derived(
    maintenanceReminders
      .filter((r) => !r.isCompleted)
      .slice()
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  );

  // Single-vehicle stats
  const lastServiceDate = $derived(logs.length > 0 ? logs[0].date : null);
  const nextServiceDate = $derived(upcomingReminders[0]?.dueDate ?? null);
  const currentOdometer = $derived(scope.vehicle?.odometer ?? logs[0]?.odometer ?? 0);

  // Fleet-wide stats
  const totalServices = $derived(logs.length);
  const totalSpent = $derived(logs.reduce((sum, l) => sum + (l.cost || 0), 0));
  const vehiclesDueSoon = $derived.by(() => {
    const dueSoonMs = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const vehicleIds = new Set(
      upcomingReminders.filter((r) => r.dueDate.getTime() <= dueSoonMs).map((r) => r.vehicleId)
    );
    return vehicleIds.size;
  });
</script>

<FeaturePageShell
  feature={Features.MAINTENANCE}
  title={maintenance_page_title()}
  description={maintenance_page_description()}
  disabledTitle={feature_maintenance_disabled_title()}
  disabledHint={feature_maintenance_disabled_hint()}
>
  {#if scope.isFleet}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Wrench}
        label={maintenance_stat_total_services()}
        value={totalServices > 0 ? totalServices : '--'}
        color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
      />
      <StatCard
        icon={DollarSign}
        label={maintenance_stat_total_spent()}
        value={totalSpent > 0 ? formatCurrency(totalSpent) : '--'}
        color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
      />
      <StatCard
        icon={AlertTriangle}
        label={maintenance_stat_due_soon()}
        value={vehiclesDueSoon}
        color="bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30"
      />
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={HeartPulse}
        label={maintenance_stat_last_service()}
        value={lastServiceDate ? formatDate(lastServiceDate) : '--'}
        color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
      />
      <StatCard
        icon={CalendarDays}
        label={maintenance_stat_next_service()}
        value={nextServiceDate ? formatDate(nextServiceDate) : '--'}
        color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
      />
      <StatCard
        icon={Gauge}
        label={maintenance_stat_odometer()}
        value={currentOdometer > 0 ? `${currentOdometer.toLocaleString()} km` : '--'}
        color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
      />
    </div>
  {/if}

  <Tabs.Root value="overview" class="w-full">
    <Tabs.List class="grid w-full max-w-xs grid-cols-2">
      <Tabs.Trigger value="overview">{maintenance_tab_overview()}</Tabs.Trigger>
      <Tabs.Trigger value="history">{maintenance_tab_history()}</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="overview" class="space-y-6">
      <div class="bg-card rounded-xl border p-5">
        <MaintenanceTimeline
          logs={logs.slice(0, 5)}
          reminders={maintenanceReminders}
          isFleet={scope.isFleet}
        />
      </div>
    </Tabs.Content>

    <Tabs.Content value="history">
      <MaintenenceLogTab />
    </Tabs.Content>
  </Tabs.Root>
</FeaturePageShell>
