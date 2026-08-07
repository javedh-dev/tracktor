<script lang="ts">
  import AreaChart from '$feature/overview/AreaChart.svelte';
  import VehicleFilterDropdown from '$dashboard/VehicleFilterDropdown.svelte';
  import { calculateFuelAmountData } from '$stores/chart.svelte';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';

  let { loading }: { loading: boolean } = $props();

  // The dashboard doesn't pre-populate fuelLogStore (unlike the fuel page's
  // FuelLogList) — fetch it fleet-wide here; in-flight requests are shared,
  // so this is a no-op if another widget already triggered the same fetch.
  $effect(() => {
    fuelLogStore.refreshFuelLogs();
  });

  let selectedVehicleIds = $state<string[]>([]);

  const filteredLogs = $derived(
    selectedVehicleIds.length
      ? (fuelLogStore.fuelLogs ?? []).filter((log) => selectedVehicleIds.includes(log.vehicleId))
      : (fuelLogStore.fuelLogs ?? [])
  );

  const chartData = $derived(calculateFuelAmountData(filteredLogs));
</script>

<AreaChart
  bare
  {chartData}
  label="Fuel Used"
  title="Fleet Fuel Trend"
  color="var(--chart-1)"
  loading={loading || fuelLogStore.processing}
  valueFormatter={(value: number) => `${value.toFixed(1)} L`}
  xFormatter={(v: Date) =>
    v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
>
  {#snippet filter()}
    <VehicleFilterDropdown
      vehicles={vehicleStore.vehicles ?? []}
      bind:selectedIds={selectedVehicleIds}
    />
  {/snippet}
</AreaChart>
