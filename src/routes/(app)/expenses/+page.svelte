<script lang="ts">
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import DonutChart from '$dashboard/DonutChart.svelte';
  import StackedAreaChart from '$dashboard/StackedAreaChart.svelte';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import { dashboardStore } from '$stores/dashboard.svelte';
  import { formatCurrency } from '$lib/helper/format.helper';
  import { onMount } from 'svelte';

  onMount(() => {
    dashboardStore.fetchSummary();
  });

  const summary = $derived(dashboardStore.summary);
  const loading = $derived(dashboardStore.loading);

  const expenseDonutData = $derived(
    summary
      ? [
          { name: 'Fuel', value: summary.expenses.breakdown.fuel, color: 'var(--chart-1)' },
          {
            name: 'Maintenance',
            value: summary.expenses.breakdown.maintenance,
            color: 'var(--chart-2)'
          },
          {
            name: 'Insurance',
            value: summary.expenses.breakdown.insurance,
            color: 'var(--chart-3)'
          }
        ].filter((d) => d.value > 0)
      : []
  );
</script>

<div class="space-y-6">
  <PageHeader title="Expenses" description="Fleet-wide expense overview" />

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <StatCard
      icon={Fuel}
      label="Fuel Costs"
      value={loading ? '...' : summary ? formatCurrency(summary.expenses.breakdown.fuel) : '--'}
      color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
    />
    <StatCard
      icon={Wrench}
      label="Maintenance Costs"
      value={loading
        ? '...'
        : summary
          ? formatCurrency(summary.expenses.breakdown.maintenance)
          : '--'}
      color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
    />
    <StatCard
      icon={Shield}
      label="Insurance Costs"
      value={loading
        ? '...'
        : summary
          ? formatCurrency(summary.expenses.breakdown.insurance)
          : '--'}
      color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
    />
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <DonutChart data={expenseDonutData} title="Expense Breakdown" {loading} height={300} />
    <StackedAreaChart
      data={summary?.expenses.monthlyTrend ?? []}
      title="Monthly Expense Trend"
      {loading}
    />
  </div>
</div>
