<script lang="ts">
  import VehicleTrendChart from '$feature/overview/VehicleTrendChart.svelte';
  import VehicleFilterDropdown from '$dashboard/VehicleFilterDropdown.svelte';
  import { chartStore } from '$stores/chart.svelte';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { formatDate, formatMileage } from '$lib/helper/format.helper';
  import { widget_mileage_overview } from '$lib/paraglide/messages/_index.js';
  import { getLocale } from '$lib/paraglide/runtime.js';

  // The dashboard doesn't pre-populate fuelLogStore (unlike the fuel page's
  // FuelLogList) — fetch it fleet-wide here; in-flight requests are shared,
  // so this is a no-op if another widget already triggered the same fetch.
  $effect(() => {
    fuelLogStore.refreshFuelLogs();
  });

  let selectedVehicleIds = $state<string[]>([]);

  const series = $derived(
    selectedVehicleIds.length
      ? chartStore.mileageByVehicle.filter((s) => selectedVehicleIds.includes(s.vehicleId))
      : chartStore.mileageByVehicle
  );
</script>

<VehicleTrendChart
  bare
  {series}
  title={widget_mileage_overview()}
  loading={fuelLogStore.processing}
  valueFormatter={(value, series) => formatMileage(value, series.fuelType)}
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
