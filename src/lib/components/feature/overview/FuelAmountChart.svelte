<script lang="ts">
  import { chartStore } from '$stores/chart.svelte';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import AreaChart from './AreaChart.svelte';
</script>

<AreaChart
  chartData={chartStore.fuelAmountData || []}
  label="Fuel (L)"
  title="Fuel Consumption Trend"
  loading={fuelLogStore.processing}
  valueFormatter={(value: number) => `${value.toFixed(1)} L`}
  xFormatter={(v: Date) =>
    v.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })}
/>
