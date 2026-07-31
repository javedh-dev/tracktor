<script lang="ts">
  import StatCard from '$dashboard/StatCard.svelte';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import Gauge from '@lucide/svelte/icons/gauge';
  import HeartPulse from '@lucide/svelte/icons/heart-pulse';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import { maintenanceStore } from '$stores/maintenance.svelte';
  import MaintenenceLogTab from '$feature/maintenance/MaintenenceLogTab.svelte';
  import MaintenanceTimeline from '$feature/maintenance/MaintenanceTimeline.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import * as Tabs from '$ui/tabs';
  import { formatDate } from '$lib/helper/format.helper';
  import {
    feature_maintenance_disabled_title,
    feature_maintenance_disabled_hint,
    maintenance_page_title,
    maintenance_page_description,
    maintenance_stat_last_service,
    maintenance_stat_next_service,
    maintenance_stat_odometer,
    maintenance_tab_overview,
    maintenance_tab_history,
    maintenance_timeline_title
  } from '$lib/paraglide/messages/_index.js';

  let lastScopeKey: string | undefined;

  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  $effect(() => {
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      maintenanceStore.refreshMaintenanceLogs(vehicleId);
    }
  });

  const logs = $derived(maintenanceStore.maintenanceLogs ?? []);
  const latestOdometer = $derived.by(() => {
    if (logs.length === 0) return 0;
    return Math.max(...logs.map((l) => l.odometer || 0));
  });
  const nextServiceOdometer = $derived(latestOdometer > 0 ? latestOdometer + 5000 : 0);
  const lastServiceDate = $derived(logs.length > 0 ? logs[0].date : null);
</script>

<FeaturePageShell
  feature={Features.MAINTENANCE}
  title={maintenance_page_title()}
  description={maintenance_page_description()}
  disabledTitle={feature_maintenance_disabled_title()}
  disabledHint={feature_maintenance_disabled_hint()}
>
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
      value={nextServiceOdometer > 0 ? `${nextServiceOdometer.toLocaleString()} km` : '--'}
      color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
    />
    <StatCard
      icon={Gauge}
      label={maintenance_stat_odometer()}
      value={latestOdometer > 0 ? `${latestOdometer.toLocaleString()} km` : '--'}
      color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
    />
  </div>

  <Tabs.Root value="overview" class="w-full">
    <Tabs.List class="grid w-full max-w-xs grid-cols-2">
      <Tabs.Trigger value="overview">{maintenance_tab_overview()}</Tabs.Trigger>
      <Tabs.Trigger value="history">{maintenance_tab_history()}</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="overview" class="space-y-6">
      <div class="bg-card rounded-xl border p-5">
        <h3 class="mb-4 text-lg font-semibold">{maintenance_timeline_title()}</h3>
        <MaintenanceTimeline logs={logs.slice(0, 5)} />
      </div>
    </Tabs.Content>

    <Tabs.Content value="history">
      <MaintenenceLogTab />
    </Tabs.Content>
  </Tabs.Root>
</FeaturePageShell>
