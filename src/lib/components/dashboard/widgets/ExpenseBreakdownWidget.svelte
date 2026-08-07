<script lang="ts">
  import DonutChart from '$dashboard/DonutChart.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';
  import { formatCurrency } from '$lib/helper/format.helper';

  let { summary, loading }: { summary: DashboardSummary | null; loading: boolean } = $props();

  const data = $derived(
    summary
      ? [
          { name: 'Fuel', value: summary.expenses.breakdown.fuel, color: 'var(--chart-1)' },
          {
            name: 'Maintenance',
            value: summary.expenses.breakdown.maintenance,
            color: 'var(--chart-2)'
          },
          {
            name: 'Compliance',
            value: summary.expenses.breakdown.compliance,
            color: 'var(--chart-3)'
          }
        ].filter((d) => d.value > 0)
      : []
  );
</script>

<DonutChart
  bare
  {data}
  {loading}
  centerLabel="Total"
  centerValueFormatter={(value) => formatCurrency(value)}
/>
