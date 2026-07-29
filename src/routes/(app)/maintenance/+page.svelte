<script lang="ts">
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import Gauge from '@lucide/svelte/icons/gauge';
  import HeartPulse from '@lucide/svelte/icons/heart-pulse';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { maintenanceStore } from '$stores/maintenance.svelte';
  import MaintenenceLogTab from '$feature/maintenance/MaintenenceLogTab.svelte';
  import MaintenanceTimeline from '$feature/maintenance/MaintenanceTimeline.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import * as Tabs from '$ui/tabs';
  import { formatDate } from '$lib/helper/format.helper';
  import {
    feature_maintenance_disabled_title,
    feature_maintenance_disabled_hint
  } from '$lib/paraglide/messages/_index.js';

  let lastVehicleId: string | undefined;

  $effect(() => {
    const vehicleId = vehicleStore.selectedId;
    if (vehicleId && vehicleId !== lastVehicleId) {
      lastVehicleId = vehicleId;
      maintenanceStore.refreshMaintenanceLogs();
    }
    if (!vehicleId) {
      lastVehicleId = undefined;
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

<FeatureGate feature={Features.MAINTENANCE}>
  {#snippet children()}
    <div class="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Track service history and upcoming maintenance"
      />

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={HeartPulse}
          label="Last Service"
          value={lastServiceDate ? formatDate(lastServiceDate) : '--'}
          color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
        />
        <StatCard
          icon={CalendarDays}
          label="Next Service"
          value={nextServiceOdometer > 0 ? `${nextServiceOdometer.toLocaleString()} km` : '--'}
          color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
        />
        <StatCard
          icon={Gauge}
          label="Odometer"
          value={latestOdometer > 0 ? `${latestOdometer.toLocaleString()} km` : '--'}
          color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
        />
      </div>

      <Tabs.Root value="overview" class="w-full">
        <Tabs.List class="grid w-full max-w-xs grid-cols-2">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="history">Service History</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="bg-card rounded-xl border p-5">
              <h3 class="mb-1 text-lg font-semibold">Next Service</h3>
              {#if nextServiceOdometer > 0}
                <p class="text-2xl font-bold tracking-tight">
                  {nextServiceOdometer.toLocaleString()} km
                </p>
                <p class="text-muted-foreground mt-1 text-sm">
                  Estimated, based on last service at {latestOdometer.toLocaleString()} km
                </p>
              {:else}
                <p class="text-muted-foreground text-sm">No service history to estimate from</p>
              {/if}
            </div>

            <div class="bg-card rounded-xl border p-5">
              <h3 class="mb-4 text-lg font-semibold">Maintenance Timeline</h3>
              <MaintenanceTimeline logs={logs.slice(0, 5)} />
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="history">
          <MaintenenceLogTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  {/snippet}
  {#snippet fallback()}
    <div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <div class="text-center">
        <p class="text-muted-foreground text-lg font-medium">
          {feature_maintenance_disabled_title()}
        </p>
        <p class="text-muted-foreground text-sm">{feature_maintenance_disabled_hint()}</p>
      </div>
    </div>
  {/snippet}
</FeatureGate>
