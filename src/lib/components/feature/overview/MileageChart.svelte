<script lang="ts">
  import { formatMileage } from '$lib/helper/format.helper';
  import { chartStore } from '$stores/chart.svelte';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import AreaChart from './AreaChart.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import { overview_chart_mileage_label } from '$lib/paraglide/messages/_index.js';

  const selectedVehicle = $derived(readVehicleScope(page.url, vehicleStore.vehicles).vehicle);
</script>

<AreaChart
  chartData={chartStore.mileageData || []}
  label={overview_chart_mileage_label()}
  title="Mileage Overview"
  loading={fuelLogStore.processing}
  valueFormatter={(value: number) => formatMileage(value, selectedVehicle?.fuelType ?? 'petrol')}
  xFormatter={(v: Date) =>
    v.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })}
/>
