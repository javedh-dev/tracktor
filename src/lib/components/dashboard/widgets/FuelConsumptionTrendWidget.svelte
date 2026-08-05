<script lang="ts">
  import VehicleTrendChart from '$feature/overview/VehicleTrendChart.svelte';
  import { chartStore } from '$stores/chart.svelte';
  import { fuelLogStore } from '$stores/fuel-log.svelte';

  // The dashboard doesn't pre-populate fuelLogStore (unlike the fuel page's
  // FuelLogList) — fetch it fleet-wide here; in-flight requests are shared,
  // so this is a no-op if another widget already triggered the same fetch.
  $effect(() => {
    fuelLogStore.refreshFuelLogs();
  });
</script>

<VehicleTrendChart
  bare
  series={chartStore.fuelAmountByVehicle}
  title="Fuel Consumption Trend"
  loading={fuelLogStore.processing}
  valueFormatter={(value) => `${value.toFixed(1)} L`}
  xFormatter={(v: Date) =>
    v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
/>
