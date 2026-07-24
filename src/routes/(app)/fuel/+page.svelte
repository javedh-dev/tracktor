<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import Fuel from '@lucide/svelte/icons/fuel';
  import DollarSign from '@lucide/svelte/icons/dollar-sign';
  import Route from '@lucide/svelte/icons/route';
  import Gauge from '@lucide/svelte/icons/gauge';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import { chartStore } from '$stores/chart.svelte';
  import MileageChart from '$feature/overview/MileageChart.svelte';
  import CostChart from '$feature/overview/CostChart.svelte';
  import FuelLogTab from '$feature/fuel/FuelLogTab.svelte';
  import SearchableSelect from '$appui/SearchableSelect.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import Tractor from '@lucide/svelte/icons/tractor';
  import { feature_fuel_disabled_title, feature_fuel_disabled_hint } from '$lib/paraglide/messages/_index.js';

  onMount(() => {
    if (vehicleStore.selectedId) {
      fuelLogStore.refreshFuelLogs();
    }
  });

  const vehicleOptions = $derived(
    vehicleStore.vehicles?.map((v) => ({
      value: v.id,
      label: `${v.make} ${v.model}${v.licensePlate ? ` (${v.licensePlate})` : ''}`
    })) ?? []
  );

  let selectedVehicleId = $state(vehicleStore.selectedId ?? '');

  $effect(() => {
    if (selectedVehicleId && selectedVehicleId !== vehicleStore.selectedId) {
      vehicleStore.selectedId = selectedVehicleId;
      fuelLogStore.refreshFuelLogs();
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
      <PageHeader title="Fuel Tracking" description="Monitor fuel consumption and costs">
        <div class="w-64">
          <SearchableSelect
            options={vehicleOptions}
            name="vehicle"
            bind:value={selectedVehicleId}
            icon={Tractor}
          />
        </div>
      </PageHeader>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Fuel}
          label="Fuel Used"
          value={totalFuelUsed > 0 ? `${totalFuelUsed.toFixed(1)} L` : '--'}
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={totalCost > 0 ? `$${totalCost.toFixed(2)}` : '--'}
          color="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          icon={Gauge}
          label="Avg Mileage"
          value={avgMileage > 0 ? avgMileage.toFixed(1) : '--'}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          icon={Route}
          label="Total Entries"
          value={totalEntries}
          color="bg-violet-500/10 text-violet-500"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MileageChart />
        <CostChart />
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
