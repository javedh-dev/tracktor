<script lang="ts">
  import VehicleTrendChart from '$feature/overview/VehicleTrendChart.svelte';
  import VehicleFilterDropdown from '$dashboard/VehicleFilterDropdown.svelte';
  import { chartStore } from '$stores/chart.svelte';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { widget_fuel_consumption_trend } from '$lib/paraglide/messages/_index.js';
  import { getLocale } from '$lib/paraglide/runtime.js';
  import { formatDate } from '$lib/helper/format.helper';

  // The dashboard doesn't pre-populate fuelLogStore (unlike the fuel page's
  // FuelLogList) — fetch it fleet-wide here; in-flight requests are shared,
  // so this is a no-op if another widget already triggered the same fetch.
  $effect(() => {
    fuelLogStore.refreshFuelLogs();
  });

  let selectedVehicleIds = $state<string[]>([]);

  const series = $derived(
    selectedVehicleIds.length
      ? chartStore.fuelAmountByVehicle.filter((s) => selectedVehicleIds.includes(s.vehicleId))
      : chartStore.fuelAmountByVehicle
  );
</script>

<VehicleTrendChart
  bare
  {series}
  title={widget_fuel_consumption_trend()}
  loading={fuelLogStore.processing}
  valueFormatter={(value) => `${value.toFixed(1)} L`}
  xFormatter={(value: Date) => formatDate(value)}
  xAxisFormatter={(value: Date) => value.toLocaleDateString(getLocale(), { month: 'short' })}
>
  {#snippet filter()}
    <VehicleFilterDropdown
      vehicles={vehicleStore.vehicles ?? []}
      bind:selectedIds={selectedVehicleIds}
    />
  {/snippet}
</VehicleTrendChart>
