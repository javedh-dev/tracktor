<script lang="ts">
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import Fuel from '@lucide/svelte/icons/fuel';
  import DollarSign from '@lucide/svelte/icons/dollar-sign';
  import Route from '@lucide/svelte/icons/route';
  import Gauge from '@lucide/svelte/icons/gauge';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import MileageChart from '$feature/overview/MileageChart.svelte';
  import FuelAmountChart from '$feature/overview/FuelAmountChart.svelte';
  import FuelLogTab from '$feature/fuel/FuelLogTab.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import {
    feature_fuel_disabled_title,
    feature_fuel_disabled_hint
  } from '$lib/paraglide/messages/_index.js';

  let lastVehicleId: string | undefined;

  $effect(() => {
    const vehicleId = vehicleStore.selectedId;
    if (vehicleId && vehicleId !== lastVehicleId) {
      lastVehicleId = vehicleId;
      fuelLogStore.refreshFuelLogs();
    }
    if (!vehicleId) {
      lastVehicleId = undefined;
    }
  });

  const fuelLogs = $derived(fuelLogStore.fuelLogs ?? []);
  const totalFuelUsed = $derived(fuelLogs.reduce((sum, l) => sum + (l.fuelAmount || 0), 0));
  const totalCost = $derived(fuelLogs.reduce((sum, l) => sum + (l.cost || 0), 0));
  const avgMileage = $derived.by(() => {
    const withMileage = fuelLogs.filter((l) => l.mileage);
    if (withMileage.length === 0) return 0;
    return withMileage.reduce((sum, l) => sum + (l.mileage || 0), 0) / withMileage.length;
  });
  const totalEntries = $derived(fuelLogs.length);
</script>

<FeatureGate feature={Features.FUEL_LOG}>
  {#snippet children()}
    <div class="space-y-6">
      <PageHeader title="Fuel Tracking" description="Monitor fuel consumption and costs" />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Fuel}
          label="Fuel Used"
          value={totalFuelUsed > 0 ? `${totalFuelUsed.toFixed(1)} L` : '--'}
          color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={totalCost > 0 ? `$${totalCost.toFixed(2)}` : '--'}
          color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
        />
        <StatCard
          icon={Gauge}
          label="Avg Mileage"
          value={avgMileage > 0 ? avgMileage.toFixed(1) : '--'}
          color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
        />
        <StatCard
          icon={Route}
          label="Total Entries"
          value={totalEntries}
          color="bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-500/30"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FuelAmountChart />
        <MileageChart />
      </div>

      <FuelLogTab />
    </div>
  {/snippet}
  {#snippet fallback()}
    <div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <div class="text-center">
        <p class="text-muted-foreground text-lg font-medium">{feature_fuel_disabled_title()}</p>
        <p class="text-muted-foreground text-sm">{feature_fuel_disabled_hint()}</p>
      </div>
    </div>
  {/snippet}
</FeatureGate>
