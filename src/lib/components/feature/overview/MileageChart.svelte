<script lang="ts">
  import { getMileageUnit, formatMileage } from '$lib/helper/format.helper';
  import { chartStore } from '$stores/chart.svelte';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import AreaChart from './AreaChart.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import {
    overview_chart_mileage_label,
    overview_chart_mileage_title
  } from '$lib/paraglide/messages/_index.js';

  const selectedVehicle = vehicleStore.vehicles?.find(
    (vehicle: any) => vehicle.id === vehicleStore.selectedId
  );
</script>

<AreaChart
  chartData={chartStore.mileageData || []}
  label={overview_chart_mileage_label()}
  title={overview_chart_mileage_title({
    unit: getMileageUnit(selectedVehicle?.fuelType as string)
  })}
  loading={fuelLogStore.processing}
  valueFormatter={(value: number) => formatMileage(value, selectedVehicle?.fuelType ?? 'petrol')}
  xFormatter={(v: Date) =>
    v.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })}
/>
