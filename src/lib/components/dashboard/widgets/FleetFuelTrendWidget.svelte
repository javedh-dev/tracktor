<script lang="ts">
  import AreaChart from '$feature/overview/AreaChart.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';

  let { summary, loading }: { summary: DashboardSummary | null; loading: boolean } = $props();

  const chartData = $derived(
    summary
      ? summary.fuel.dailyTrend.map((point) => ({ x: new Date(point.date), y: point.fuelAmount }))
      : []
  );
</script>

<AreaChart
  bare
  {chartData}
  label="Fuel Used"
  title="Fleet Fuel Trend"
  color="var(--chart-1)"
  {loading}
  valueFormatter={(value: number) => `${value.toFixed(1)} L`}
  xFormatter={(v: Date) =>
    v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
/>
