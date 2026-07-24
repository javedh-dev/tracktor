<script lang="ts">
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import DonutChart from '$dashboard/DonutChart.svelte';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import { dashboardStore } from '$stores/dashboard.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    dashboardStore.fetchSummary();
  });

  const summary = $derived(dashboardStore.summary);
  const loading = $derived(dashboardStore.loading);

  const expenseDonutData = $derived(
    summary
      ? [
          { name: 'Fuel', value: summary.expenseBreakdown.fuel, color: 'var(--chart-1)' },
          {
            name: 'Maintenance',
            value: summary.expenseBreakdown.maintenance,
            color: 'var(--chart-2)'
          },
          { name: 'Insurance', value: summary.expenseBreakdown.insurance, color: 'var(--chart-3)' }
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
      value={loading ? '...' : summary ? `$${summary.expenseBreakdown.fuel.toFixed(2)}` : '--'}
      color="bg-green-500/10 text-green-500"
    />
    <StatCard
      icon={Wrench}
      label="Maintenance Costs"
      value={loading
        ? '...'
        : summary
          ? `$${summary.expenseBreakdown.maintenance.toFixed(2)}`
          : '--'}
      color="bg-blue-500/10 text-blue-500"
    />
    <StatCard
      icon={Shield}
      label="Insurance Costs"
      value={loading ? '...' : summary ? `$${summary.expenseBreakdown.insurance.toFixed(2)}` : '--'}
      color="bg-amber-500/10 text-amber-500"
    />
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <DonutChart data={expenseDonutData} title="Expense Breakdown" {loading} height={300} />
    <div class="bg-secondary lg:bg-background/50 flex h-64 items-center justify-center rounded-lg">
      <p class="text-muted-foreground text-sm">Monthly expense trend chart coming soon</p>
    </div>
  </div>
</div>
