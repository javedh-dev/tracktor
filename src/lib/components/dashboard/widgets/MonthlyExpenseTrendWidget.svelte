<script lang="ts">
  import StackedAreaChart from '$dashboard/StackedAreaChart.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';

  let { summary, loading }: { summary: DashboardSummary | null; loading: boolean } = $props();
</script>

<StackedAreaChart
  bare
  data={summary?.expenses.monthlyTrend ?? []}
  title="Monthly Expense Trend"
  {loading}
/>
